# Domain & IP Error Diagnostic Tool

An all-in-one tool to check DNS propagation, WHOIS info, SSL certificate, IP geolocation and open ports — built with **Laravel** and **React JS**.

---

## Features

- **DNS Propagation status** for individual DNS records  
- **IP Geolocation** for city, region, ISP, ASN tied to the IP
- **Port Scanner** for checking statuses of selected ports
- **SSL Checker** for certificate issuer, dates of issue and expiration
- **WHOIS Lookup** for registrar, expiration of the domain and etc.

---

## How to Use

1. **Open the tool**  
   Go to [https://psavickas.xyz](https://psavickas.xyz) in your browser.

2. **Enter a domain or IPv4 address**  
   - **Domain** (no protocol or trailing slash):  
     - ✅ Valid examples:  
       ```txt
       example.com
       subdomain.example.co.uk
       ```  
     - ❌ Invalid examples:  
       ```txt
       https://example.com
       example.com/
       ```  
   - **IPv4 address** (four numbers 0–255):  
     - ✅ Valid examples:  
       ```txt
       1.1.1.1
       255.255.255.255
       ```  
     - ❌ Invalid examples:  
       ```txt
       1.1.1.1:23
       192.168.0.0/24
       ```

3. **Choose your check**  
   - **Domain → DNS records**  
     Select **one** of:  
     ```
     A, AAAA, CNAME, MX, NS, TXT, SOA, CAA
     ```
   - **IP → Ports**  
     Select any of the common ports:  
     ```
      21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 8080, 3306, 3389
     ```  
     Or **add a custom port** (1–65535).

4. **Run the check**  
   Click the **Check** button. Results will appear below.

5. **(Optional) WHOIS lookup**  
   For domains, click **Check WHOIS** to view registrar, creation/expiry dates, nameservers, etc.


---

## Tech Stack

- **Back end:** Laravel 12 with 4 external APIs
- **Front end:** React, Vite 
- **Styling:** Plain CSS

---

## External APIs

The tool integrates with several third-party services to gather up-to-date network and domain information:

- **Port Checker API**  
  - **Endpoint:** `https://portchecker.io/api/{ip}/{port}`  
  - **What it does:** Tests whether specified TCP ports on an IPv4 address are open or closed. We send your selected ports and receive a simple JSON response indicating each port’s status.

- **SSL Checker API**  
  - **Endpoint:** `https://ssl-checker.io/api/v1/check/{domain}`  
  - **What it does:** Retrieves SSL/TLS certificate details for a domain, including the issuer, validity period (start and end dates), and days remaining until expiration. We parse this to show you certificate health at a glance.

- **WHOIS API (ip2whois.com)**  
  - **Endpoint:** `https://api.ip2whois.com/v2?key={key}&domain={domain}`  
  - **What it does:** Fetches WHOIS registration data for domains, such as registrar name, creation/updated/expires dates, and nameservers. This helps you identify ownership and lifecycle information.

- **IP Geolocation API (ip2location.io)**  
  - **Endpoint:** `https://api.ip2location.io/?key={key}&ip={ip}`  
  - **What it does:** Provides geolocation details (city, region, country), ISP and ASN information for an IPv4 address. This powers our “IP Location” panel to show you where an IP is physically located.

> **Note:** Some of these services require an API key - be sure to configure your `.env` file with the appropriate credentials before running the application.


## Requirements

- PHP 8.2+  
- Composer 2  
- Node.js 16+ & npm/yarn

---

## Installation
- Clone the repository
- Install NodeJS with npm and Composer
- Update Composer packages with "composer update"
- Edit the example .env file by adding an API key from api.ip2whois.com. It should be added like so: IP2WHOIS_API_KEY="key"
- Run "npm run dev" and "php artisan serve"

## Installation
Follow these steps to get the project up and running locally:
1. Clone the repository
Open your terminal and run:
```
git clone https://github.com/pauliusssavickas/DiagnosticTool.git
cd DiagnosticTool
```
2. Install dependencies
Ensure you have Node.js (with npm) and Composer installed. Then run:
```
composer install
npm install
```
3. Set up environment variables
- Copy the example .env file:
```
cp .env.example .env
```
- Generate a new key for the application:
```
php artisan key:generate
```
- Edit the .env file and add your API key from api.ip2whois.com:
```
IP2WHOIS_API_KEY="your_api_key_here"
```
4. Update Composer packages
Make sure all PHP packages are up to date:
```
composer update
```
5. Start the development servers
- Start the frontend development server:
```
npm run dev
```
- Start the Laravel PHP development server:
```
php artisan serve
```
You should now be able to access the application in your browser
   
