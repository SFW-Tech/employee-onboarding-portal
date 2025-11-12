import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations"; 
import { routes } from "./app.routes"; 
import { RootComponent } from "./root.component";

bootstrapApplication(RootComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(), 
  ],
}).catch((err) => console.error(err));
