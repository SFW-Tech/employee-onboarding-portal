import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  forwardRef,
  input,
  signal,
  computed,
  viewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-file-input",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: "./file-input.component.html",
  styleUrls: ["./file-input.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true,
    },
  ],
})
export class FileInputComponent implements ControlValueAccessor {
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>("fileInput");

  label = input.required<string>();
  multiple = input<boolean>(false);
  accept = input<string>("*/*");

  /** 5 MB limit (in bytes) */
  readonly MAX_SIZE = 5 * 1024 * 1024;

  /** Unique ID */
  inputId = "file_" + Math.random().toString(36).substring(2, 9);

  selectedFileNames = signal<string[]>([]);
  errorMessage = signal<string | null>(null);
  isDragging = signal(false);

  private onChange: (value: File | FileList | null) => void = () => {};
  private onTouched: () => void = () => {};

  acceptLabel = computed(() =>
    this.accept() === "*/*"
      ? "Any file type"
      : `Accepted types: ${this.accept()}`
  );

  triggerFileInputClick(): void {
    this.fileInput().nativeElement.click();
  }

  writeValue(value: any): void {
    if (!value && this.fileInput()?.nativeElement) {
      this.fileInput().nativeElement.value = "";
      this.selectedFileNames.set([]);
      this.errorMessage.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    this.handleFiles(files);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);

    const files = e.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
      if (this.fileInput()?.nativeElement) {
        this.fileInput().nativeElement.files = files;
      }
    }
  }

  /** Main file handler with 5MB limit */
  private handleFiles(files: FileList | null | undefined): void {
    if (!files || files.length === 0) {
      this.clearFiles();
      return;
    }

    const fileArray = Array.from(files);
    const tooLarge = fileArray.find((f) => f.size > this.MAX_SIZE);

    if (tooLarge) {
      this.errorMessage.set("Maximum file size is 5 MB");
      this.clearFiles();
      return;
    }

    this.errorMessage.set(null);
    this.selectedFileNames.set(fileArray.map((f) => f.name));
    this.onChange(this.multiple() ? files : files[0]);
    this.onTouched();
  }

  clearFiles(): void {
    this.selectedFileNames.set([]);
    this.errorMessage.set(null);

    if (this.fileInput()?.nativeElement) {
      this.fileInput().nativeElement.value = "";
    }

    this.onChange(null);
    this.onTouched();
  }
}
