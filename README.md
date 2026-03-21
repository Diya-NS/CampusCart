# CampusCart 🛒🎓

CampusCart is a secure, role-based, hyper-local marketplace web application designed exclusively for college students, faculty, and staff. It enables users to securely sell, bargain, and buy products directly from peers within their specific college community. 

##  Key Features
- **Student-to-Student Marketplace**: Hyper-local focus ensuring trusted transactions within a single college campus.
- **Role-Based Authentication**: Custom dashboards and features explicitly tailored for **Buyers**, **Sellers**, and **Admins**.
- **Real-time Offers & Bargaining**: Buyers can make custom price offers on listings. Sellers can Accept or Reject them from their dashboard.
- **Secure Direct Checkout flow**: Upon offer acceptance or standard checkout, buyers are presented with the Seller's UPI QR code. A screenshot of the transaction is uploaded as proof of payment.
- **Custom Delivery Management**: Advanced order logistics allow buyers to enter detailed notes (e.g., *Drop off at Hostel B, Room 302 after 5 PM*) for sellers directly at checkout.
- **Premium Glassmorphic UI**: High-end, custom vanilla CSS design highlighting gorgeous vibrant colors, smooth transitions, and dynamic UI elements.

---

##  Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend API**: Node.js, Express.js
- **Database Architecture**: MySQL with relational joins ensuring optimal performance
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` for secure hashed password generation
- **Storage**: `multer` middleware for secure image handling and proof-of-payment uploads