
# TimeCapsule Connect

**TimeCapsule Connect** is an innovative platform that allows users to create, store, and share time capsules in a collaborative and interactive environment. Designed for both everyday users and power users, the platform combines a rich text editor, real-time collaboration features, and advanced location-based unlocking. Whether you're sending a message for the future or preserving memories with loved ones, TimeCapsule Connect ensures a seamless and engaging experience.

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
   - [Prerequisites](#prerequisites)
   - [Setup Guide](#setup-guide)
5. [Usage](#usage)
6. [Contributing](#contributing)
7. [License](#license)
8. [Future Enhancements](#future-enhancements)
9. [Contact](#contact)

---

## ✨ Introduction

TimeCapsule Connect is designed to bring the concept of time capsules into the digital age. By combining modern web technologies with an intuitive user interface, it allows you to create capsules that can be unlocked at a later time, either by yourself or by collaborators. The platform leverages Google Maps integration, real-time collaborative editing, and a hybrid text editor for a rich and seamless experience.

---

## 🔥 Features

- **Real-Time Collaborative Editing**: Using Yjs and SlateJS for efficient and conflict-free editing.
- **Hybrid Text Editor**: TipTap for casual users, Slate for power users with advanced features.
- **Location-Based Unlocking**: Set a location with Google Maps’ Place Autocomplete feature to unlock your capsule.
- **Chunked Uploads**: For large media files, supporting resumable uploads (1GB+).
- **Secure and Scalable**: KSUID for unique and secure capsule IDs with easy scalability.
- **Rich Media Support**: Upload images, videos, and text content with full media support.
- **Modern UI**: Sleek, user-friendly design ensuring smooth user interaction.

---

## 🧰 Tech Stack

### **Frontend**

- **ReactJS**: Main framework for building the user interface.
- **SlateJS** & **TipTap**: Hybrid text editors that allow flexible and advanced text manipulation.
- **Yjs**: Real-time collaborative editing library to enable multiple users to edit simultaneously.
- **Google Maps API**: For location-based unlocking of time capsules.

### **Backend**

- **Node.js**: Server-side runtime environment.
- **MongoDB**: NoSQL database for storing capsules, user data, and media.
- **Express.js**: Web framework to build and manage API endpoints.
- **Socket.io**: For real-time communication (such as updates and changes in collaborative editing).

### **Others**

- **KSUID**: For generating unique and time-ordered identifiers for capsules.
- **Blob-to-Base64**: For handling and uploading media files in a base64 format.

---

## ⚙️ Installation

### **Prerequisites**

Before running the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (or a MongoDB-compatible database)
- **npm** (Node package manager)

### **Setup Guide**

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Subhronilmukhopadhyay/timecapsule-connect.git
   cd timecapsule-connect
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add the following:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   This will launch both the frontend and backend servers. You can view the app at `http://localhost:3000`.

---

## 🚀 Usage

Once the app is running, here's how you can use it:

- **Creating a Capsule**: Navigate to the "Create Capsule" page, add your text, images, and media, and set the unlock date and location.
- **Collaborative Editing**: Share your capsule with others for real-time editing. They can contribute text, images, or comments.
- **Unlocking a Capsule**: The capsule will be unlocked only when the location and time conditions are met.
- **Media Handling**: Upload and view media, ensuring large files (1GB+) are supported via resumable uploads.

---

## 🤝 Contributing

We welcome contributions! Whether you want to add new features, fix bugs, or improve documentation, we would love to have you.

### How to Contribute

1. Fork the repository on GitHub.
2. Clone your fork to your local machine.
3. Create a new branch for your feature/bugfix: `git checkout -b feature/your-feature`.
4. Commit your changes: `git commit -m 'Add new feature'`.
5. Push to your branch: `git push origin feature/your-feature`.
6. Open a Pull Request to the main repository.

---

## 🛠️ Future Enhancements

Here are some planned features and improvements for TimeCapsule Connect:

- **Capsule Analytics**: View statistics on capsule views, interactions, and unlocks.
- **Version History**: Track and revert to previous versions of a capsule.
- **Notifications**: Get notified when a capsule is unlocked or when changes are made in collaborative editing.
- **Mobile App**: A native mobile app for better accessibility and mobile-based capsule creation.
- **Blockchain Integration**: For immutable storage and future-proofing capsules.


---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
