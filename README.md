# TimeCapsule Connect

**TimeCapsule Connect** is an innovative platform that allows users to create, store, and share time capsules in a collaborative and interactive environment. Designed for both everyday users and power users, the platform combines a rich text editor, real-time collaboration, location-based unlocking, and large media support. Whether you're sending a message to your future self or preserving memories with loved ones, TimeCapsule Connect ensures a seamless and engaging experience.

---

## ✨ Introduction

TimeCapsule Connect brings the nostalgic concept of time capsules into the digital age. Users can create rich, multimedia capsules that can be unlocked in the future based on time and location constraints. With real-time collaboration, advanced editing, and cloud storage capabilities, it's perfect for both personal and group memory-keeping.

---

## 🔥 Features

- **Real-Time Collaborative Editing**  
  Powered by **Yjs** and **SlateJS** to enable simultaneous, conflict-free editing by multiple users.
  
- **Advanced Text Editor**  
  Using **SlateJS** to offer a powerful editing experience with support for headings, lists, links, images, code blocks, and more.

- **Location-Based Unlocking**  
  Capsules can only be accessed at specific geolocations using **Google Maps’ Place Autocomplete** and Geolocation APIs.

- **Time-Locked Capsules**  
  Capsules can be scheduled to unlock at a future date/time, enforcing both temporal and spatial access constraints.

- **Chunked & Resumable Uploads**  
  Supports large files (1GB+) with resumable upload capability for robust media handling.

- **Unique Capsule IDs**  
  Capsules are identified using **KSUID**, which ensures global uniqueness and chronological sorting.

- **Rich Media Support**  
  Upload and embed videos, images, audio, and formatted text into your capsules.

- **Secure Sharing**  
  Collaborators can be invited securely through capsule links or access tokens.

- **Capsule Activity Log**  
  Track changes, editor sessions, and activity over time.

- **Clean and Responsive UI**  
  Built with a modern design aesthetic for intuitive use across devices.

---

## 🧰 Tech Stack

### **Frontend**

- **ReactJS** – Component-based UI framework.
- **SlateJS** – Feature-rich, customizable text editor.
- **Yjs** – Peer-to-peer CRDT for real-time editing.
- **Google Maps API** – For place selection and location-locking capsules.

### **Backend**

- **Node.js** – Server environment.
- **Express.js** – REST API framework.
- **MongoDB** – NoSQL document store for capsules, users, and media.
- **Socket.io** – Real-time event-based communication.

### **Others**

- **KSUID** – Collision-free, time-sortable unique ID generation.
- **Multer + Resumable.js** – For efficient and large file uploads.
- **Base64 Blob Handler** – Handles conversion and transfer of large media.

---

## ⚙️ Installation

### **Prerequisites**

Ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB**
- **npm** or **yarn**

### **Steps**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Subhronilmukhopadhyay/timecapsule-connect.git
   cd timecapsule-connect
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory with:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to explore the app.

---

## 🚀 Usage

- **Create a Capsule**: Compose a message, add media, set a location and unlock time.
- **Collaborate**: Share capsule links with others for simultaneous editing.
- **Unlock**: Capsules remain inaccessible until both the unlock time and geolocation criteria are met.
- **View & Edit History**: Track edits and changes made over time by collaborators.

---

## 🧪 Testing

- Simulate multi-user collaboration by opening capsules in multiple tabs or devices.
- Test chunked uploads by uploading large files (~1GB+).
- Ensure capsule unlocks only when both **time** and **location** match the preset constraints.

---

## 🤝 Contributing

We welcome contributions!

### Steps to Contribute

1. Fork the repository.
2. Clone your fork locally.
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Commit your changes.
5. Push and open a Pull Request.

Please ensure your code adheres to project structure and naming conventions.

---

## 🌱 Planned Enhancements

- **Capsule Analytics** – Insights on opens, edits, and shares.
- **Version History** – Ability to roll back to older capsule versions.
- **Push Notifications** – Real-time alerts when capsules are unlocked or modified.
- **Native Mobile App** – Android/iOS support for capsule creation and unlocking.
- **Blockchain Integration** – Immutable ledger for capsule integrity and timestamp proofs.
- **Offline Draft Support** – Work on capsules offline and sync later.

---

## 📝 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for more details.

---

## 📬 Contact

For any questions, suggestions, or feedback, feel free to reach out to us via GitHub Issues or connect on [LinkedIn](https://www.linkedin.com/in/subhronilmukhopadhyay/).