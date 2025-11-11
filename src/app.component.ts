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


import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

type Option = { id: number | string; name: string };

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);

 
  employeeForm: FormGroup;


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

  constructor() {
    
    this.employeeForm = this.fb.group({
      personal_information: this.fb.group({
        first_name: ["", Validators.required],
        last_name: ["", Validators.required],
        full_name: [{ value: "", disabled: true }],
        gender: ["", Validators.required],
        date_of_birth: [null, Validators.required],
      }),
      contact_information: this.fb.group({
        email: ["", [Validators.required, Validators.email]],
        phone_number: ["", Validators.required],
        alternate_phone: [""],
        address_line1: ["", Validators.required],
        address_line2: [""],
        country: [null as number | null, Validators.required],
        state: [
          { value: null as number | null, disabled: true },
          Validators.required,
        ],
        city: [
          { value: null as number | null, disabled: true },
          Validators.required,
        ],
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
    });

  
    this.countries.set(this.locationService.getCountries());

    
    const personal = this.personal_information;
    personal
      .get("first_name")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.updateFullName());
    personal
      .get("last_name")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.updateFullName());

   
    const contact = this.contact_information;
    contact
      .get("country")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((countryId: number | null) => {
        const state = contact.get("state");
        const city = contact.get("city");
        state?.reset({ value: null, disabled: true });
        city?.reset({ value: null, disabled: true });
        this.states.set([]);
        this.cities.set([]);

        if (countryId) {
          this.states.set(this.locationService.getStatesOfCountry(countryId));
          state?.enable();
        }
      });

    contact
      .get("state")
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((stateId: number | null) => {
        const city = contact.get("city");
        city?.reset({ value: null, disabled: true });
        this.cities.set([]);

        if (stateId) {
          this.cities.set(this.locationService.getCitiesOfState(stateId));
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

  /** Handle form submission */
  onSubmit(): void {
    this.employeeForm.markAllAsTouched();

    if (this.employeeForm.invalid) {
      alert("❌ Please fill out all required fields correctly.");
      console.warn("Form invalid:", this.employeeForm);
      return;
    }

    const payload = this.employeeForm.getRawValue();
    console.log("✅ Payload sent successfully:", payload);

    alert("✅ Form submitted successfully!");
  }

 
  onReset(): void {
    this.employeeForm.reset();
    console.log("🔄 Form reset complete");
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
