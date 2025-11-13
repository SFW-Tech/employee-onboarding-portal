import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { LocationService } from "./services/location.service";
import { FileInputComponent } from "./components/file-input/file-input.component";

// ✅ ngx-captcha
import { NgxCaptchaModule } from "ngx-captcha";

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

import {
  HttpClientModule,
  HttpClient,
  HttpErrorResponse,
} from "@angular/common/http";

import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

type Option = { id: number | string; name: string };

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,

    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,

    FileInputComponent,

    // ✅ ngx-captcha
    NgxCaptchaModule,

    MatSnackBarModule,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);

  employeeForm: FormGroup;
  captchaVerified = false;

  countries = signal<Option[]>([]);
  states = signal<Option[]>([]);
  cities = signal<Option[]>([]);

  genderOptions: Option[] = [
    { id: "male", name: "Male" },
    { id: "female", name: "Female" },
    { id: "other", name: "Other" },
  ];

  bloodGroupOptions: Option[] = [
    { id: "A+", name: "A+" },
    { id: "A-", name: "A-" },
    { id: "B+", name: "B+" },
    { id: "B-", name: "B-" },
    { id: "AB+", name: "AB+" },
    { id: "AB-", name: "AB-" },
    { id: "O+", name: "O+" },
    { id: "O-", name: "O-" },
  ];

  private readonly API_URL =
    "https://azure-proxy-production.up.railway.app/api/proxy/dynamics?endPoint=cr276_sfemployeemasters";

  constructor() {
    this.employeeForm = this.fb.group({
      personal_information: this.fb.group({
        first_name: ["", Validators.required],
        last_name: ["", Validators.required],
        full_name: [""],
        gender: ["", Validators.required],
        date_of_birth: [null, Validators.required],
      }),

      contact_information: this.fb.group({
        email: ["", [Validators.required, Validators.email]],
        phone_number: ["", Validators.required],
        alternate_phone: [""],
        address_line1: ["", Validators.required],
        address_line2: [""],
        country: [null, Validators.required],
        state: [{ value: null, disabled: true }, Validators.required],
        city: [{ value: null, disabled: true }, Validators.required],
        postal_code: [""],
      }),

      identity_documents: this.fb.group({
        employee_photo: [null],
        id_proof: [null],
        address_proof_file: [null],
        pan_card: [null],
        pan_number: [""],
        passport_number: [""],
        aadhaar_number: [""],
        access_card_id: [""],
      }),

      education_and_career: this.fb.group({
        educational_certificates: [null],
        experience_certificates: [null],
        resume_cv: [null],
      }),

      employment_documents: this.fb.group({
        joining_letter: [null],
        relieving_letter: [null],
        other_documents: [null],
      }),

      other: this.fb.group({
        emergency_contact_number: [""],
        emergency_contact_name: [""],
        blood_group: [""],
      }),

      recaptcha: ["", Validators.required],
    });

    this.countries.set(this.locationService.getCountries());

    this.personal_information
      .get("first_name")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.updateFullName());

    this.personal_information
      .get("last_name")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.updateFullName());

    const contact = this.contact_information;

    contact
      .get("country")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const id = Number(value);

        this.states.set([]);
        this.cities.set([]);

        const state = contact.get("state");
        const city = contact.get("city");

        state?.reset({ value: null, disabled: true });
        city?.reset({ value: null, disabled: true });

        if (id > 0) {
          this.states.set(this.locationService.getStatesOfCountry(id));
          state?.enable();
        }
      });

    contact
      .get("state")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const id = Number(value);

        this.cities.set([]);

        const city = contact.get("city");

        city?.reset({ value: null, disabled: true });

        if (id > 0) {
          this.cities.set(this.locationService.getCitiesOfState(id));
          city?.enable();
        }
      });
  }

  private updateFullName(): void {
    const first = this.personal_information.get("first_name")?.value || "";
    const last = this.personal_information.get("last_name")?.value || "";
    this.personal_information
      .get("full_name")
      ?.setValue(`${first} ${last}`.trim());
  }

  // ✅ Captcha success
  onCaptchaResolved(token: string): void {
    this.employeeForm.get("recaptcha")?.setValue(token);
    this.captchaVerified = true;
  }

  // ✅ Captcha reset handler
  onCaptchaReset(): void {
    this.employeeForm.get("recaptcha")?.reset();
    this.captchaVerified = false;
  }

  private addIfExists(target: any, key: string, value: any) {
    if (value == null || (typeof value === "string" && value.trim() === ""))
      return;
    target[key] = value;
  }

  private mapLocationValues(form: any) {
    const countryName =
      this.locationService.getCountries().find((c) => c.id === form.country)
        ?.name || "";

    const stateName =
      this.locationService
        .getStatesOfCountry(Number(form.country))
        .find((s) => s.id === form.state)?.name || "";

    const cityName =
      this.locationService
        .getCitiesOfState(Number(form.state))
        .find((c) => c.id === form.city)?.name || "";

    return { countryName, stateName, cityName };
  }

  onSubmit(): void {
    this.employeeForm.markAllAsTouched();

    if (this.employeeForm.invalid || !this.captchaVerified) {
      this.snack.open("❌ Please complete all required fields!", "Close", {
        duration: 3000,
        panelClass: ["toast-error"],
      });
      return;
    }

    const form = this.employeeForm.getRawValue();

    let dobIso: string | null = null;
    if (form.personal_information.date_of_birth) {
      const d = new Date(form.personal_information.date_of_birth);
      if (!isNaN(d.getTime())) dobIso = d.toISOString();
    }

    const genderMap: any = { male: 1, female: 2, other: 3 };
    const genderNumber = genderMap[form.personal_information.gender];

    const { countryName, stateName, cityName } = this.mapLocationValues(
      form.contact_information
    );

    const data: any = {};

    data["cr276_employment_status"] = 5;
    data["cr276_joining_date"] = new Date().toISOString();

    this.addIfExists(
      data,
      "cr276_first_name",
      form.personal_information.first_name
    );
    this.addIfExists(
      data,
      "cr276_last_name",
      form.personal_information.last_name
    );
    this.addIfExists(data, "cr276_gender", genderNumber);
    this.addIfExists(data, "cr276_date_of_birth", dobIso);

    this.addIfExists(data, "cr276_email", form.contact_information.email);
    this.addIfExists(
      data,
      "cr276_phone_number",
      form.contact_information.phone_number
    );
    this.addIfExists(
      data,
      "cr276_address_line1",
      form.contact_information.address_line1
    );
    this.addIfExists(
      data,
      "cr276_address_line2",
      form.contact_information.address_line2
    );
    this.addIfExists(
      data,
      "cr276_postal_code",
      form.contact_information.postal_code
    );

    this.addIfExists(data, "cr276_country", countryName);
    this.addIfExists(data, "cr276_state", stateName);
    this.addIfExists(data, "cr276_city", cityName);

    this.addIfExists(
      data,
      "cr276_pan_number",
      form.identity_documents.pan_number
    );
    this.addIfExists(
      data,
      "cr276_passport_number",
      form.identity_documents.passport_number
    );
    this.addIfExists(
      data,
      "cr276_aadhaar_number",
      form.identity_documents.aadhaar_number
    );
    this.addIfExists(
      data,
      "cr276_access_card_id",
      form.identity_documents.access_card_id
    );

    this.addIfExists(
      data,
      "cr276_emergency_contact_name",
      form.other.emergency_contact_name
    );
    this.addIfExists(
      data,
      "cr276_emergency_contact_number",
      form.other.emergency_contact_number
    );
    this.addIfExists(data, "cr276_blood_group", form.other.blood_group);

    const payload = { data };

    console.log("📦 FINAL PAYLOAD SENT:", payload);

    this.http.post(this.API_URL, payload).subscribe({
      next: (res) => {
        this.snack.open("🎉 Form submitted successfully!", "OK", {
          duration: 3000,
          panelClass: ["toast-success"],
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error("❌ API ERROR:", err);
        this.snack.open("❌ Submission failed. Check console.", "Close", {
          duration: 3000,
          panelClass: ["toast-error"],
        });
      },
    });
  }

  onReset(): void {
    this.employeeForm.reset();
    this.captchaVerified = false;

    this.snack.open("🔄 Form reset successfully!", "OK", {
      duration: 2000,
      panelClass: ["toast-success"],
    });
  }

  get personal_information() {
    return this.employeeForm.get("personal_information") as FormGroup;
  }
  get contact_information() {
    return this.employeeForm.get("contact_information") as FormGroup;
  }
  get identity_documents() {
    return this.employeeForm.get("identity_documents") as FormGroup;
  }
  get education_and_career() {
    return this.employeeForm.get("education_and_career") as FormGroup;
  }
  get employment_documents() {
    return this.employeeForm.get("employment_documents") as FormGroup;
  }
  get other() {
    return this.employeeForm.get("other") as FormGroup;
  }
}
