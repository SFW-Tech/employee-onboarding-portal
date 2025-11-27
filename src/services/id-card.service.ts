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

  // -------------------------------
  // DATE FORMATTER: DD-MMM-YYYY
  // -------------------------------
  private formatDate(d: string | undefined): string {
    if (!d) return "—";

    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";

    const day = String(date.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const mon = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${mon}-${year}`;
  }

  // -------------------------------
  // GENDER FORMATTER
  // -------------------------------
  private formatGender(g?: string): string {
    if (!g) return "—";

    const map: any = {
      male: "Male",
      female: "Female",
      other: "Other",
    };

    return map[g] ?? "—";
  }

  // -------------------------------------------------------
  // FRONT SIDE
  // -------------------------------------------------------
  async generateFront(params: {
    fullName: string;
    gender?: string;
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

    ctx.fillStyle = "#ffffff";
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

    const size = 300;
    const px = (this.W - size) / 2;
    const py = 200;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, size, size, 20);
    ctx.clip();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px, py, size, size);

    if (params.photoDataUrl) {
      const img = await this.loadImage(params.photoDataUrl);

      const scale = size / img.width;
      const w = img.width * scale;
      const h = img.height * scale;

      const dx = px;
      const dy = py + (size - h) / 4;

      ctx.drawImage(img, dx, dy, w, h);
    }

    ctx.restore();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 42px Inter";
    ctx.textAlign = "center";
    ctx.fillText(params.fullName.toUpperCase(), this.W / 2, 560);

    ctx.textAlign = "start";
    ctx.font = "22px Inter";
    ctx.fillStyle = "#111827";

    let y = 620;
    const left = 100;

    const row = (label: string, value: any) => {
      ctx.fillText(label, left, y);
      ctx.fillText(": " + (value || "—"), left + 160, y);
      y += 38;
    };

    // ✔ FIXED GENDER
    row("Gender", this.formatGender(params.gender));

    row("Phone", params.phone);
    row("DOB", this.formatDate(params.dob));

    return this.canvasToBlob(canvas);
  }

  // -------------------------------------------------------
  // BACK SIDE
  // -------------------------------------------------------
  async generateBack(params: {
    emergencyName?: string;
    emergencyNumber?: string;
    bloodGroup?: string;
    address?: string;
    joiningDate?: string;
    expireDate?: string;
    logoSrc: string;
  }): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = this.W;
    canvas.height = this.H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
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
    ctx.font = "bold 30px Inter";
    ctx.fillText("EMERGENCY INFO", 40, 250);

    ctx.fillStyle = "#111827";
    ctx.font = "22px Inter";

    let y = 320;
    const x1 = 60;
    const x2 = 270;

    const row = (label: string, value?: string) => {
      ctx.fillText(label, x1, y);
      ctx.fillText(value || "—", x2, y);
      y += 42;
    };

    row("Emergency Contact", params.emergencyName);
    row("Contact Number", params.emergencyNumber);
    row("Blood Group", params.bloodGroup);

    y += 25;
    ctx.fillText("Office Phone", x1, y);
    ctx.fillText("+91 7397720330", x2, y);
    y += 50;

    ctx.fillText("Office Address", x1, y);
    y += 35;

    const officeLines = [
      "7/2A, Shreesha Building,",
      "First Floor, Central Studio Road,",
      "Dhanalakshmi Puram South,",
      "Singanallur, Coimbatore,",
      "Tamil Nadu - 641005",
    ];

    officeLines.forEach((line) => {
      ctx.fillText(line, x2, y);
      y += 28;
    });

    y += 40;

    ctx.fillText(
      "Validation On: " + this.formatDate(params.joiningDate),
      x1,
      y
    );
    ctx.fillText(
      "Valid Till: " + this.formatDate(params.expireDate),
      x1 + 270,
      y
    );

    return this.canvasToBlob(canvas);
  }

  // -------------------------------------------------------
  // COMBINED
  // -------------------------------------------------------
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
