import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { AppComponent } from "./app.component"; // your onboarding form

export const routes: Routes = [
  { path: "", component: HomeComponent }, // Home page
  { path: "onboarding", component: AppComponent },
  { path: "**", redirectTo: "" },
];
