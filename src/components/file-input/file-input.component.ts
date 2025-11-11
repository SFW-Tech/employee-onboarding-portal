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

  id = `file-input-${Math.random().toString(36).substring(2, 9)}`;
  selectedFileNames = signal<string[]>([]);
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
    e.stopPropagation();
    this.isDragging.set(true);
  }
  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }
  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
      if (this.fileInput()?.nativeElement)
        this.fileInput().nativeElement.files = files;
    }
  }

  private handleFiles(files: FileList | null | undefined): void {
    if (files && files.length > 0) {
      const names = Array.from(files).map((f) => f.name);
      this.selectedFileNames.set(names);
      this.onChange(this.multiple() ? files : files[0]);
    } else {
      this.selectedFileNames.set([]);
      this.onChange(null);
    }
    this.onTouched();
  }

  clearFiles(): void {
    this.selectedFileNames.set([]);
    if (this.fileInput()?.nativeElement)
      this.fileInput().nativeElement.value = "";
    this.onChange(null);
    this.onTouched();
  }
}
