# API Endpoints ที่ต้องมีใน Backend

## Base URL
```
http://localhost:3000/api
```

## Authentication Headers
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### 1. POST `/auth/register`
**Description:** สมัครสมาชิกใหม่

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "USER" | "ORGANIZER",
  "companyName": "string" // required if role is ORGANIZER
}
```

**Response:**
```json
{
  "message": "Registration successful"
}
```

---

### 2. POST `/auth/login`
**Description:** เข้าสู่ระบบ

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "id": "number",
  "email": "string",
  "name": "string",
  "role": "USER" | "ORGANIZER" | "ADMIN"
}
```

---

## 🎤 Event Endpoints

### 3. GET `/events`
**Description:** ดึงรายการงานคอนเสิร์ตทั้งหมด (Public)

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "venue": "string",
    "event_date": "string (ISO 8601)",
    "poster_url": "string",
    "ticket_types": [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "total_quantity": "number",
        "sold_quantity": "number"
      }
    ]
  }
]
```

---

### 4. GET `/events/:id`
**Description:** ดึงรายละเอียดงานคอนเสิร์ต (Public)

**Response:**
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "venue": "string",
  "event_date": "string (ISO 8601)",
  "poster_url": "string",
  "ticket_types": [
    {
      "id": "number",
      "name": "string",
      "price": "number",
      "total_quantity": "number",
      "sold_quantity": "number"
    }
  ]
}
```

---

### 5. POST `/events`
**Description:** สร้างงานคอนเสิร์ตใหม่ (Organizer/Admin only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "venue": "string",
  "event_date": "string (ISO 8601)",
  "poster_url": "string",
  "ticket_types": [
    {
      "name": "string",
      "price": "number",
      "total_quantity": "number"
    }
  ]
}
```

**Response:**
```json
{
  "id": "number",
  "message": "Event created successfully"
}
```

---

## 🎫 Organizer Endpoints

### 6. GET `/organizer/events`
**Description:** ดึงรายการงานคอนเสิร์ตของ Organizer (Organizer/Admin only)

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "venue": "string",
    "event_date": "string (ISO 8601)",
    "poster_url": "string",
    "ticket_types": [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "total_quantity": "number",
        "sold_quantity": "number"
      }
    ]
  }
]
```

---

### 7. PUT `/organizer/events/:id`
**Description:** แก้ไขงานคอนเสิร์ต (Organizer/Admin only - เฉพาะงานของตัวเอง)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "venue": "string",
  "event_date": "string (ISO 8601)",
  "poster_url": "string",
  "ticket_types": [
    {
      "id": "number", // optional, ถ้ามีคือแก้ไข, ถ้าไม่มีคือเพิ่มใหม่
      "name": "string",
      "price": "number",
      "total_quantity": "number"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Event updated successfully"
}
```

---

### 8. DELETE `/organizer/events/:id`
**Description:** ลบงานคอนเสิร์ต (Organizer/Admin only - เฉพาะงานของตัวเอง)

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

---

### 9. GET `/organizer/orders`
**Description:** ดึงคำสั่งซื้อของงานที่ Organizer เป็นเจ้าของ (Organizer/Admin only)

**Response:**
```json
[
  {
    "id": "number",
    "total_amount": "number",
    "status": "string",
    "created_at": "string (ISO 8601)",
    "items": [
      {
        "name": "string",
        "qty": "number"
      }
    ]
  }
]
```

---

## 🛒 Order Endpoints

### 10. POST `/orders/purchase`
**Description:** ซื้อบัตรคอนเสิร์ต (User/Organizer/Admin - ต้อง login)

**Request Body:**
```json
{
  "items": [
    {
      "ticketTypeId": "number",
      "quantity": "number"
    }
  ]
}
```

**Response:**
```json
{
  "id": "number",
  "message": "Purchase successful",
  "order": {
    "id": "number",
    "total_amount": "number",
    "status": "PAID",
    "created_at": "string (ISO 8601)",
    "items": [
      {
        "name": "string",
        "qty": "number"
      }
    ]
  }
}
```

**Error Cases:**
- บัตรไม่พอ: `400 Bad Request` with message
- Ticket type ไม่พบ: `404 Not Found`
- ไม่ได้ login: `401 Unauthorized`

---

### 11. GET `/orders/my-orders`
**Description:** ดึงคำสั่งซื้อของ User (User/Organizer/Admin - ต้อง login)

**Response:**
```json
[
  {
    "id": "number",
    "total_amount": "number",
    "status": "string",
    "created_at": "string (ISO 8601)",
    "items": [
      {
        "name": "string",
        "qty": "number"
      }
    ]
  }
]
```

---

### 12. GET `/orders/:id`
**Description:** ดึงรายละเอียดคำสั่งซื้อ (User/Organizer/Admin - เฉพาะของตัวเอง)

**Response:**
```json
{
  "id": "number",
  "total_amount": "number",
  "status": "string",
  "created_at": "string (ISO 8601)",
  "items": [
    {
      "name": "string",
      "qty": "number"
    }
  ]
}
```

---

## 👤 User Profile Endpoints

### 13. PUT `/user/profile`
**Description:** อัปเดตข้อมูลโปรไฟล์ (ต้อง login)

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 14. PUT `/user/change-password`
**Description:** เปลี่ยนรหัสผ่าน (ต้อง login)

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Error Cases:**
- รหัสผ่านปัจจุบันไม่ถูกต้อง: `400 Bad Request`

---

## 👑 Admin Endpoints

### 15. GET `/admin/users`
**Description:** ดึงรายชื่อผู้ใช้ทั้งหมด (Admin only)

**Response:**
```json
[
  {
    "id": "number",
    "email": "string",
    "name": "string",
    "role": "USER" | "ORGANIZER" | "ADMIN"
  }
]
```

---

### 16. DELETE `/admin/users/:id`
**Description:** ลบผู้ใช้ (Admin only)

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Note:** ไม่ควรลบตัวเอง

---

### 17. GET `/admin/orders`
**Description:** ดึงคำสั่งซื้อทั้งหมด (Admin only)

**Response:**
```json
[
  {
    "id": "number",
    "total_amount": "number",
    "status": "string",
    "created_at": "string (ISO 8601)",
    "items": [
      {
        "name": "string",
        "qty": "number"
      }
    ]
  }
]
```

---

### 18. DELETE `/admin/events/:id`
**Description:** ลบงานคอนเสิร์ต (Admin only - ลบได้ทุกงาน)

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

---

## 📝 Notes

### Authentication
- ทุก endpoint ที่ต้อง login ต้องส่ง `Authorization: Bearer <token>` ใน header
- Token ควรมีข้อมูล user (id, email, role) เพื่อใช้ตรวจสอบสิทธิ์

### Error Responses
ทุก endpoint ควร return error ในรูปแบบ:
```json
{
  "error": "string",
  "message": "string" // optional
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

### Validation
- Email format validation
- Password minimum length (แนะนำ 6 ตัวอักษร)
- Required fields validation
- Date format validation (ISO 8601)
- Number validation (price, quantity ต้องเป็นจำนวนบวก)

### Business Logic
1. **ซื้อบัตร:** ต้องตรวจสอบว่า:
   - Ticket type ยังมีเหลืออยู่
   - จำนวนที่ซื้อไม่เกินจำนวนที่เหลือ
   - อัปเดต `sold_quantity` หลังจากซื้อสำเร็จ

2. **แก้ไขงาน:** ต้องตรวจสอบว่า:
   - Organizer เป็นเจ้าของงานจริงๆ
   - Admin สามารถแก้ไขได้ทุกงาน

3. **ลบงาน:** ต้องตรวจสอบว่า:
   - มีคำสั่งซื้อแล้วหรือยัง (อาจจะไม่อนุญาตให้ลบ)
   - Organizer เป็นเจ้าของงานจริงๆ

4. **เปลี่ยนรหัสผ่าน:** ต้องตรวจสอบว่า:
   - รหัสผ่านปัจจุบันถูกต้อง
   - รหัสผ่านใหม่ต้องมีความยาวเพียงพอ

---

## 🎯 Priority (เรียงตามความสำคัญ)

### High Priority (ต้องมีก่อน)
1. POST `/auth/register`
2. POST `/auth/login`
3. GET `/events`
4. GET `/events/:id`
5. POST `/orders/purchase`
6. GET `/orders/my-orders`

### Medium Priority
7. POST `/events` (สร้างงาน)
8. GET `/organizer/events`
9. PUT `/organizer/events/:id`
10. DELETE `/organizer/events/:id`
11. GET `/orders/:id`

### Low Priority (Nice to have)
12. PUT `/user/profile`
13. PUT `/user/change-password`
14. GET `/admin/users`
15. GET `/admin/orders`
16. DELETE `/admin/users/:id`
17. DELETE `/admin/events/:id`
18. GET `/organizer/orders`

