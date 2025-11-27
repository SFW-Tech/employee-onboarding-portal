import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { AppComponent } from "./app.component";
import { ThankYouComponent } from "./pages/thank-you/thank-you.component";

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
    path: "thank-you",
    component: ThankYouComponent,
    data: { animation: "ThankYouPage" },
  },
  {
    path: "**",
    redirectTo: "",
  },
];
