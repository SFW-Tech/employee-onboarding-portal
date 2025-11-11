import "zone.js"; // ✅ Required for Angular change detection

import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
// import { provideAnimations } from "@angular/platform-browser/animations"; // optional

import { routes } from "./app.routes";
import { RootComponent } from "./root.component"; // ✅ this will now resolve correctly

bootstrapApplication(RootComponent, {
  providers: [
    provideRouter(routes),
    // provideAnimations(), // optional
  ],
}).catch((err) => console.error(err));
