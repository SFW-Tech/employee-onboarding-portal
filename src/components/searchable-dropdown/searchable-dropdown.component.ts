import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  signal,
  computed,
  ElementRef,
  viewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonModule } from "@angular/common";

export interface DropdownOption {
  id: any;
  name: string;
}

@Component({
  selector: "app-searchable-dropdown",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./searchable-dropdown.component.html",
  styleUrls: ["./searchable-dropdown.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true,
    },
  ],
  host: {
    "(document:click)": "onDocumentClick($event)",
  },
})
export class SearchableDropdownComponent implements ControlValueAccessor {
  // ================================
  // 🔹 Template References
  // ================================
  dropdownContainer = viewChild.required<ElementRef>("dropdownContainer");
  searchInput = viewChild<ElementRef<HTMLInputElement>>("searchInput");

  // ================================
  // 🔹 Inputs
  // ================================
  label = input.required<string>();
  options = input.required<DropdownOption[] | null>();
  placeholder = input<string>("Select an option");

  id = `dropdown-${Math.random().toString(36).substring(2, 9)}`;

  // ================================
  // 🔹 Signals
  // ================================
  isOpen = signal(false);
  searchTerm = signal("");
  selectedOption = signal<DropdownOption | null>(null);
  disabled = signal(false);

  // ================================
  // 🔹 Form ControlValueAccessor
  // ================================
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // Filtered Options
  filteredOptions = computed(() => {
    const options = this.options() ?? [];
    const search = this.searchTerm().toLowerCase();
    return search
      ? options.filter((opt) => opt.name.toLowerCase().includes(search))
      : options;
  });

  writeValue(value: any): void {
    const options = this.options() ?? [];
    const found = options.find((o) => o.id === value) || null;
    this.selectedOption.set(found);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ================================
  // 🔹 Dropdown Logic
  // ================================
  toggleDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.update((open) => !open);

    if (this.isOpen()) {
      setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
    }
  }

  selectOption(option: DropdownOption): void {
    this.selectedOption.set(option);
    this.onChange(option.id);
    this.onTouched();
    this.isOpen.set(false);
    this.searchTerm.set("");
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onDocumentClick(event: MouseEvent): void {
    if (
      this.isOpen() &&
      !this.dropdownContainer().nativeElement.contains(event.target as Node)
    ) {
      this.isOpen.set(false);
    }
  }
}
