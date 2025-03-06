# SMS Scheduler Backend

This project is built using **Node.js (Express)** with **MongoDB** for data storage and **BullMQ (Redis)** for queue processing.

## 🚀 How to Run the Project

1️⃣ Clone the project and navigate into the directory:  
`git clone https://github.com/Harsh-3006/datmanBackend.git && cd datmanBackend`  

2️⃣ Install dependencies:  
`npm install`  

3️⃣ Create a `.env` file and add the required environment variables:  

PORT=your_port 
MONGOURI=your_mongodb_uri
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password 
REDIS_HOST_URL=your_redis_host_url 
JWT_SECRET=your_jwt_secret 
MAIL=your_email 
MAILPASS=your_email_password

4️⃣ Start the project:  
`cd src && nodemon index.js`  

---

### ✅ Important Notes:
- Ensure the **.env** file is correctly set up before running the project.
- Redis must be running for queue processing.

---
