import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  constructor(private router: Router) {}
  startOnboarding() {
    this.router.navigate(["/onboarding"]);
  }
}
