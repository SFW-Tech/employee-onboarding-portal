import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { AppComponent } from "./app.component"; 

export const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    data: { animation: "HomePage" },
  },
  {
    path: "onboarding",
    component: AppComponent,
    data: { animation: "OnboardingPage" },
  },
  {
    path: "**",
    redirectTo: "",
  },
];
