// ============================================================
// src/app/app.component.ts
//  - Standalone onboarding component
// ============================================================

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

import { HttpClientModule, HttpClient } from "@angular/common/http";
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
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

import { firstValueFrom } from "rxjs";

import { LocationService } from "./services/location.service";
import { FileInputComponent } from "./components/file-input/file-input.component";
import { IdCardService } from "./services/id-card.service";
import { BlobUploadService } from "./services/blob-upload.service";
import { environment } from "./environments/environment";


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
  private idCard = inject(IdCardService);
  private blobUpload = inject(BlobUploadService);

  captchaKey = environment.recaptchaSiteKey;

  employeeForm: FormGroup;
  captchaVerified = false;
  isSubmitting = false;

  previewVisible = false;
  submitEnabled = false;


  frontPreviewUrl = signal<string | null>(null);
  backPreviewUrl = signal<string | null>(null);
  combinedPreviewUrl = signal<string | null>(null);
  private lastCombinedBlob: Blob | null = null;

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

  private readonly API_URL = environment.API_URL;

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
        pass_book: [null],
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
        emergency_contact_relation: [""],
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

  onCaptchaResolved(token: string): void {
    this.employeeForm.get("recaptcha")?.setValue(token);
    this.captchaVerified = true;
  }

  onCaptchaReset(): void {
    this.employeeForm.get("recaptcha")?.reset();
    this.captchaVerified = false;

    
    this.previewVisible = false;
    this.submitEnabled = false;
  }

  private addIfExists(target: any, key: string, value: any) {
    if (value == null || (typeof value === "string" && value.trim() === ""))
      return;
    target[key] = value;
  }

  private mapLocationValues(contactForm: any) {
    const countryName =
      this.locationService
        .getCountries()
        .find((c) => c.id === contactForm.country)?.name || "";

    const stateName =
      this.locationService
        .getStatesOfCountry(Number(contactForm.country))
        .find((s) => s.id === contactForm.state)?.name || "";

    const cityName =
      this.locationService
        .getCitiesOfState(Number(contactForm.state))
        .find((c) => c.id === contactForm.city)?.name || "";

    return { countryName, stateName, cityName };
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = String(fr.result);
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.readAsDataURL(blob);
    });
  }

  private buildAddress(form: any): string {
    const contact = form.contact_information;
    const arr: string[] = [];

    if (contact.address_line1) arr.push(contact.address_line1);
    if (contact.address_line2) arr.push(contact.address_line2);

    const { countryName, stateName, cityName } =
      this.mapLocationValues(contact);

    if (cityName) arr.push(cityName);
    if (stateName) arr.push(stateName);
    if (countryName) arr.push(countryName);

    return arr.join(", ");
  }

  private makeSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }


  async generatePreviewFromForm(): Promise<void> {
  
    const form = this.employeeForm.getRawValue();

    const photoFile: File = form.identity_documents.employee_photo;
    let photoDataUrl: string | undefined = undefined;

    if (photoFile instanceof File) {
      const img = await this.loadImage(photoFile);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      photoDataUrl = canvas.toDataURL("image/png");
    }

    const fullName =
      `${form.personal_information.first_name} ${form.personal_information.last_name}`.trim();

    const today = new Date();
    const expire = new Date(today);
    expire.setMonth(expire.getMonth() + 3);

    const frontParams = {
      fullName,
      phone: form.contact_information.phone_number,
      bloodGroup: form.other.blood_group,
      dob: form.personal_information.date_of_birth
        ? new Date(form.personal_information.date_of_birth).toISOString()
        : undefined,
      joiningDate: today.toISOString(),
      photoDataUrl,
      logoSrc: "assets/Sfw-Logo.svg",
    };

    const backParams = {
      emergencyName: form.other.emergency_contact_name,
      emergencyNumber: form.other.emergency_contact_number,
      emergencyRelation: form.other.emergency_contact_relation,
      bloodGroup: form.other.blood_group,
      address: this.buildAddress(form),
      joiningDate: today.toLocaleDateString(),
      expireDate: expire.toLocaleDateString(),
      logoSrc: "assets/Sfw-Logo.svg",
    };

    const frontBlob = await this.idCard.generateFront(frontParams);
    const backBlob = await this.idCard.generateBack(backParams);

    this.frontPreviewUrl.set(await this.blobToDataUrl(frontBlob));
    this.backPreviewUrl.set(await this.blobToDataUrl(backBlob));

    const combinedBlob = await this.idCard.generateCombined({
      front: frontParams,
      back: backParams,
    });

    this.lastCombinedBlob = combinedBlob;
    this.combinedPreviewUrl.set(await this.blobToDataUrl(combinedBlob));

  
    this.previewVisible = true;
    this.submitEnabled = true;
  }


  private async uploadAllFiles(form: any) {
    const fullName =
      `${form.personal_information.first_name} ${form.personal_information.last_name}`.trim() ||
      "employee";
    const slug = this.makeSlug(fullName || "employee");
    const ts = Date.now();

    const result = {
      idFront: null as string | null,
      employeePhoto: null as string | null,
      aadhar: null as string | null,
      pan: null as string | null,
      eduCert: null as string | null,
      expCert: null as string | null,
      resume: null as string | null,
      bank: null as string | null,
    };

    if (this.lastCombinedBlob) {
      const idFileName = `${slug}-idcard-front-back-${ts}.png`;
      const idFile = new File([this.lastCombinedBlob], idFileName, {
        type: "image/png",
      });
      result.idFront = await this.blobUpload.uploadAndGetUrl(
        idFile,
        idFileName
      );
    }

    const employeePhoto: File | null = form.identity_documents.employee_photo;
    if (employeePhoto instanceof File) {
      const ext = employeePhoto.name.split(".").pop() || "jpg";
      const fileName = `${slug}-employee_photo-${ts}.${ext}`;
      result.employeePhoto = await this.blobUpload.uploadAndGetUrl(
        employeePhoto,
        fileName
      );
    }

    const aadharFile: File | null = form.identity_documents.id_proof;
    if (aadharFile instanceof File) {
      const ext = aadharFile.name.split(".").pop() || "png";
      const fileName = `${slug}-aadhar-${ts}.${ext}`;
      result.aadhar = await this.blobUpload.uploadAndGetUrl(
        aadharFile,
        fileName
      );
    }

    const panFile: File | null = form.identity_documents.pan_card;
    if (panFile instanceof File) {
      const ext = panFile.name.split(".").pop() || "jpg";
      const fileName = `${slug}-pan-${ts}.${ext}`;
      result.pan = await this.blobUpload.uploadAndGetUrl(panFile, fileName);
    }

    const eduFile: File | null =
      form.education_and_career.educational_certificates;
    if (eduFile instanceof File) {
      const ext = eduFile.name.split(".").pop() || "png";
      const fileName = `${slug}-edu_cert-${ts}.${ext}`;
      result.eduCert = await this.blobUpload.uploadAndGetUrl(eduFile, fileName);
    }

    const expFile: File | null =
      form.education_and_career.experience_certificates;
    if (expFile instanceof File) {
      const ext = expFile.name.split(".").pop() || "png";
      const fileName = `${slug}-exp_cert-${ts}.${ext}`;
      result.expCert = await this.blobUpload.uploadAndGetUrl(expFile, fileName);
    }

    const resumeFile: File | null = form.education_and_career.resume_cv;
    if (resumeFile instanceof File) {
      const ext = resumeFile.name.split(".").pop() || "pdf";
      const fileName = `${slug}-resume-${ts}.${ext}`;
      result.resume = await this.blobUpload.uploadAndGetUrl(
        resumeFile,
        fileName
      );
    }

    const bankFile: File | null = form.identity_documents.pass_book;
    if (bankFile instanceof File) {
      const ext = bankFile.name.split(".").pop() || "png";
      const fileName = `${slug}-bank_passbook-${ts}.${ext}`;
      result.bank = await this.blobUpload.uploadAndGetUrl(bankFile, fileName);
    }

    return result;
  }

 
  async onSubmit(): Promise<void> {
    this.employeeForm.markAllAsTouched();

    if (this.employeeForm.invalid || !this.submitEnabled) {
      this.snack.open("❌ Please complete required steps!", "Close", {
        duration: 3000,
        panelClass: ["toast-error"],
      });
      return;
    }

    const form = this.employeeForm.getRawValue();
    this.isSubmitting = true;

    try {
      const uploadedUrls = await this.uploadAllFiles(form);

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

      data["cr276_address_line2"] =
        form.contact_information.address_line2?.trim() || null;

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

      data["cr276_employee_temp_id_card_link"] = uploadedUrls.idFront ?? null;

      data["cr276_employee_photo_link"] = uploadedUrls.employeePhoto ?? null;
      data["cr276_employee_aadhar_link"] = uploadedUrls.aadhar ?? null;
      data["cr276_employee_pan_link"] = uploadedUrls.pan ?? null;
      data["cr276_employee_edu_certificate_link"] =
        uploadedUrls.eduCert ?? null;
      data["cr276_employee_last_exp_certificate_link"] =
        uploadedUrls.expCert ?? null;
      data["cr276_employee_updated_cv_link"] = uploadedUrls.resume ?? null;
      data["cr276_employee_bank_link"] = uploadedUrls.bank ?? null;

      data["cr276_employee_photoid"] = null;
      data["cr276_employee_photo_timestamp"] = null;
      data["cr276_employee_photo"] = null;
      data["cr276_id_proof_name"] = null;
      data["cr276_address_proof"] = null;
      data["cr276_address_proof_file"] = null;
      data["cr276_address_proof_file_name"] = null;
      data["cr276_pan_card_name"] = null;
      data["cr276_educational_certificates_name"] = null;
      data["cr276_experience_certificates_name"] = null;
      data["cr276_resume_cv_name"] = null;
      data["cr276_joining_letter_name"] = null;
      data["cr276_relieving_letter_name"] = null;
      data["cr276_other_documents_name"] = null;

      data["cr276_department"] = null;
      data["cr276_designation"] = null;
      data["cr276_employee_code"] = null;
      data["cr276_employee_id"] = null;
      data["cr276_employment_type"] = null;
      data["cr276_full_name"] = null;
      data["cr276_work_location"] = null;
      data["cr276_work_mode"] = null;

      const payload = { data };

      console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

      await firstValueFrom(this.http.post(this.API_URL, payload));

      this.snack.open("Form submitted successfully!", "OK", {
        duration: 3000,
        panelClass: ["toast-success"],
      });
    } catch (err) {
      console.error("API/UPLOAD ERROR:", err);
      this.snack.open("Submission failed. Check console.", "Close", {
        duration: 3000,
        panelClass: ["toast-error"],
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onReset(): void {
    this.employeeForm.reset();
    this.captchaVerified = false;
    this.frontPreviewUrl.set(null);
    this.backPreviewUrl.set(null);
    this.combinedPreviewUrl.set(null);
    this.lastCombinedBlob = null;

    this.previewVisible = false;
    this.submitEnabled = false;

    this.snack.open("Form reset successfully!", "OK", {
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
