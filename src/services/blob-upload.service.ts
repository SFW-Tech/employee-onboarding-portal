import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BlobUploadService {
  constructor(private http: HttpClient) {}

  private readonly BASE_SAS_URL = environment.BASE_SAS_URL;

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
