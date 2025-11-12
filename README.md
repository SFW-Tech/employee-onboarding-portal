# 📌 Employee Onboarding Portal

## 🚀 Overview
The **Employee Onboarding Portal** is a web-based application designed to streamline the onboarding process for new hires.  
It integrates with **Power Apps (Employee Master Data)** to ensure seamless data synchronization, reduce duplicate entries, and provide a unified onboarding experience.

---

## 🏗️ Tech Stack
- **Frontend:** Angular 14+ (Material UI, Responsive Design)  
- **Backend:** Node.js (NestJS/Express, TypeORM, PostgreSQL)  
- **Integration:** REST APIs with Power Apps (Dataverse / Office 365)  
- **Authentication:** Azure AD (SSO) or JWT  
- **Deployment:** Azure App Service / AWS / On-Prem  

---

## 👥 User Roles
- **HR/Admin**
  - Create onboarding tasks & workflows
  - Approve/reject documents
  - Sync employees with Power Apps
  - Monitor onboarding progress  

- **New Hire (Employee)**
  - Complete profile information
  - Upload documents
  - Acknowledge policies
  - Track onboarding status  

- **Manager**
  - Approve department/role mapping
  - Assign buddy/mentor
  - Verify onboarding checklist  

---

## 📦 Core Features

### 1️⃣ Employee Profile Management
- Personal, Work, Banking, and Emergency details  
- Auto-sync with **Power Apps Employee Master**  

### 2️⃣ Document Management
- Upload & verify ID proofs, tax details, academic/experience docs  
- HR/Admin approval workflow  

### 3️⃣ Onboarding Tasks / Checklist
- Auto-generated onboarding tasks  
- Progress tracking per employee  

### 4️⃣ Policy & Training Acknowledgement
- NDA, Code of Conduct, IT Usage, Leave Policy  
- Digital acknowledgement/e-sign  

### 5️⃣ Manager & Buddy Assignment
- Assign reporting manager  
- Assign mentor/buddy  
- Notification system  

### 6️⃣ Integration with Power Apps
- Two-way sync (Portal ↔ Power Apps)  
- Background scheduler for periodic sync  
- Webhooks for real-time updates  

### 7️⃣ Notifications & Communication
- Welcome email, reminders, approvals  
- Email/SMS/Push notifications  

### 8️⃣ Reporting & Dashboard
- HR Dashboard: overall onboarding progress  
- Employee Dashboard: personal onboarding progress  

---

## 🔐 Security & Compliance
- Role-based access control (RBAC)  
- Data encryption at rest & in transit  
- Audit logging for all activities  
- GDPR & IT policy compliance  

---

## ⚙️ Non-Functional Requirements
- **Scalability:** Supports 1000+ concurrent users  
- **Performance:** API response < 500ms  
- **Availability:** 99.9% uptime  
- **Responsive:** Works across mobile & desktop  

---

## 🔄 Integration Flow with Power Apps
- **Portal → Power Apps:** Push new/approved employee data  
- **Power Apps → Portal:** Pull employee master data  
- **Sync Mechanism:**  
  - REST APIs (OAuth 2.0)  
  - Scheduler jobs (Node.js Cron)  
  - Webhooks (if supported)  

---

## 🏗️ System Architecture
```mermaid
flowchart LR
    subgraph User["👤 User (HR / Employee / Manager)"]
        U1["Browser / Mobile (Angular Frontend)"]
    end

    subgraph Frontend["🌐 Angular App"]
        A1["UI Components"]
        A2["Auth (Azure AD / JWT)"]
        U1 --> A1
        A1 --> A2
    end

    subgraph Backend["⚙️ Node.js Backend"]
        B1["REST API (Express/NestJS)"]
        B2["Business Logic & Validation"]
        B3["Database (PostgreSQL)"]
        B4["Sync Service (CRON/Webhooks)"]
        A2 --> B1
        B1 --> B2
        B2 --> B3
        B2 --> B4
    end

    subgraph PowerApps["🟦 Power Apps / Dataverse"]
        P1["Employee Master Data"]
    end

    B4 <--> P1
