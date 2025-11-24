
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class IdCardService {
  private W = 600;
  private H = 900;

  private readonly WAVE = "assets/id-header.svg";

  constructor() {}

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject("Image load failed: " + src);
      img.src = src;
    });
  }

  private async svgToImage(svgPath: string): Promise<HTMLImageElement> {
    const res = await fetch(svgPath);
    const svg = await res.text();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = await this.loadImage(url);
    URL.revokeObjectURL(url);
    return img;
  }

  private async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
  }

  private formatDob(dobIso?: string): string {
    if (!dobIso) return "—";
    const d = new Date(dobIso);
    if (isNaN(d.getTime())) return "—";

    const day = String(d.getDate()).padStart(2, "0");
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${mon}-${year}`;
  }

 
  async generateFront(params: {
    fullName: string;
    designation?: string;
    phone?: string;
    bloodGroup?: string;
    dob?: string;
    joiningDate?: string;
    photoDataUrl?: string;
    logoSrc: string;
  }): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = this.W;
    canvas.height = this.H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, this.W, this.H);

    const wave = await this.svgToImage(this.WAVE);
    ctx.drawImage(wave, 0, 0, this.W, 220);

    ctx.save();
    ctx.translate(this.W, this.H);
    ctx.rotate(Math.PI);
    ctx.drawImage(wave, 0, 0, this.W, 220);
    ctx.restore();

   
    try {
      const logo = await this.loadImage(params.logoSrc);
      const lw = 140;
      const lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, this.W - lw - 30, 90, lw, lh);
    } catch {}

    
    const size = 260;
    const px = (this.W - size) / 2;
    const py = 160;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, size, size, 20);
    ctx.clip();
    ctx.fillStyle = "#eef2f7";
    ctx.fillRect(px, py, size, size);

    if (params.photoDataUrl) {
      const img = await this.loadImage(params.photoDataUrl);
      const scale = Math.max(size / img.width, size / img.height);
      const sw = size / scale;
      const sh = size / scale;
      ctx.drawImage(
        img,
        (img.width - sw) / 2,
        (img.height - sh) / 2,
        sw,
        sh,
        px,
        py,
        size,
        size
      );
    }

    ctx.restore();

 
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 40px Inter";
    ctx.textAlign = "center";
    ctx.fillText(params.fullName.toUpperCase(), this.W / 2, 460);

    ctx.fillStyle = "#2563eb";
    ctx.font = "22px Inter";
    ctx.fillText(params.designation?.toUpperCase() ?? "", this.W / 2, 495);

    ctx.font = "20px Inter";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "start";

    let y = 560;
    const left = 60;

    const row = (label: string, value?: string) => {
      ctx.fillText(label, left, y);
      ctx.fillText(": " + (value || "—"), left + 150, y);
      y += 36;
    };

    row("Blood", params.bloodGroup);
    row("Phone", params.phone);
    row("DOB", this.formatDob(params.dob));

    return this.canvasToBlob(canvas);
  }


  async generateBack(params: {
    emergencyName?: string;
    emergencyNumber?: string;
    bloodGroup?: string;
    joiningDate?: string;
    expireDate?: string;
    logoSrc: string;
  }): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = this.W;
    canvas.height = this.H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, this.W, this.H);

    const wave = await this.svgToImage(this.WAVE);
    ctx.drawImage(wave, 0, 0, this.W, 220);

    ctx.save();
    ctx.translate(this.W, this.H);
    ctx.rotate(Math.PI);
    ctx.drawImage(wave, 0, 0, this.W, 220);
    ctx.restore();

   
    try {
      const logo = await this.loadImage(params.logoSrc);
      const lw = 140;
      const lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, this.W - lw - 30, 90, lw, lh);
    } catch {}

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 28px Inter";
    ctx.fillText("EMERGENCY INFO", 40, 240);

    ctx.fillStyle = "#111827";
    ctx.font = "20px Inter";

    let y = 310;

    const x1 = 60; 
    const x2 = 280; 

    const rw = (label: string, value?: string) => {
      ctx.fillText(label, x1, y);
      ctx.fillText(value || "—", x2, y);
      y += 40;
    };

    rw("Emergency Contact", params.emergencyName);
    rw("Contact Number", params.emergencyNumber);
    rw("Blood Group", params.bloodGroup);

    
    y += 20;

  
    ctx.fillText("Office Phone", x1, y);
    ctx.fillText("+91 7397720330", x2, y);
    y += 50;

    ctx.font = "20px Inter";
    ctx.fillText("Office Address", x1, y);
    y += 36;

    
    const officeLines = [
      "7/2A, Shreesha Building,",
      "First Floor, Central Studio Road,",
      "Dhanalakshmi Puram South,",
      "Singanallur, Coimbatore,",
      "Tamil Nadu - 641005",
    ];

    officeLines.forEach((line) => {
      ctx.fillText(line, x2, y);
      y += 26;
    });

    y += 40;

   
    ctx.fillText("Validation On: " + (params.joiningDate || "—"), x1, y);
    ctx.fillText("Valid Till: " + (params.expireDate || "—"), x1 + 270, y);

    return this.canvasToBlob(canvas);
  }

  async generateCombined(params: { front: any; back: any }): Promise<Blob> {
    const GAP = 50;

    const canvas = document.createElement("canvas");
    canvas.width = this.W * 2 + GAP;
    canvas.height = this.H;
    const ctx = canvas.getContext("2d")!;

    const frontBlob = await this.generateFront(params.front);
    const backBlob = await this.generateBack(params.back);

    const frontUrl = URL.createObjectURL(frontBlob);
    const backUrl = URL.createObjectURL(backBlob);

    const frontImg = await this.loadImage(frontUrl);
    const backImg = await this.loadImage(backUrl);

    URL.revokeObjectURL(frontUrl);
    URL.revokeObjectURL(backUrl);

    ctx.drawImage(frontImg, 0, 0, this.W, this.H);
    ctx.drawImage(backImg, this.W + GAP, 0, this.W, this.H);

    return this.canvasToBlob(canvas);
  }
}
