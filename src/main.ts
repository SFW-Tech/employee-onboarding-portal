import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideHttpClient } from "@angular/common/http";
import { routes } from "./app.routes";
import { RootComponent } from "./root.component";

bootstrapApplication(RootComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(), // ← REQUIRED
  ],
}).catch((err) => console.error(err));
