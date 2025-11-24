import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BlobUploadService {
  constructor(private http: HttpClient) {}

  private readonly BASE_SAS_URL =
    "https://sfwalpha.blob.core.windows.net/sfwalphafiles/dummy.pdf?sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-12-31T01:07:53Z&st=2025-11-17T16:52:53Z&spr=https&sig=lFLoYjrz8UHuj1DoNStHQmij4EBmIiD2%2FSDPHMP9b8o%3D";

  private buildSasUrl(filename: string): string {
    const [base, query] = this.BASE_SAS_URL.split("?");
    const container = base.substring(0, base.lastIndexOf("/") + 1);
    return container + filename + "?" + query;
  }

  async uploadAndGetUrl(file: File, filename: string): Promise<string> {
    const sasUrl = this.buildSasUrl(filename);

   
    await firstValueFrom(
      this.http.put(sasUrl, file, {
        headers: { "x-ms-blob-type": "BlockBlob" },
        responseType: "text",
      })
    );

   
    return sasUrl;
  }
}
