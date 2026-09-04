# NOWADRAW – WIRESHARK NETWORK ANALYSIS GUIDE (STEP 15)

Tài liệu hướng dẫn bắt và phân tích gói tin mạng của hệ thống **NowaDraw**, phục vụ việc đánh giá, đối chiếu thực nghiệm giữa giao thức **TCP** (Client–Server / Signaling) và **UDP** (WebRTC Peer-to-Peer Realtime).

---

## 1. Bảng phân định lưu lượng mạng trong NowaDraw

| Tầng / Giao thức | Cổng (Port) | Vai trò trong NowaDraw | Đặc tính kỹ thuật |
| :--- | :--- | :--- | :--- |
| **HTTP (TCP)** | `5000` | REST API (Authentication, Room Metadata, Snapshot) | Hướng kết nối, tin cậy tuyệt đối, retransmission khi mất gói |
| **WebSocket (TCP)** | `5000` (`/signaling`) | WebRTC Signaling (Join, Leave, Offer, Answer, ICE Candidate) | Kênh song công liên tục qua TCP, đảm bảo đúng thứ tự bản tin đàm phán |
| **STUN (UDP)** | `19302` | Khám phá địa chỉ IP Public và cổng NAT (NAT Traversal) | Không kết nối, độ trễ cực thấp, truy vấn Server phản hồi IP công khai |
| **DTLS (UDP)** | Động (Dynamic) | Mã hóa kênh truyền và trao đổi khóa mật mã giữa các Peer | TLS qua Datagram UDP, bảo vệ tính riêng tư cho Audio, Video và Data |
| **SRTP (UDP)** | Động (Dynamic) | Truyền luồng Audio và Video trực tiếp giữa các Peer | Ưu tiên thời gian thực, không truyền lại gói trễ để tránh delay |
| **SCTP qua DTLS (UDP)** | Động (Dynamic) | WebRTC DataChannel (Sự kiện vẽ Whiteboard, Tọa độ trỏ chuột, Tin nhắn Chat) | Truyền tải thông điệp tin cậy hoặc bán tin cậy trên nền UDP |

---

## 2. Chuẩn bị môi trường bắt gói tin (Capture Setup)

1. Tải và cài đặt **Wireshark** (từ [wireshark.org](https://www.wireshark.org)).
2. Nếu kiểm thử trên cùng 1 máy tính (2 trình duyệt khác nhau):
   - Chọn card mạng: **Adapter for loopback traffic capture** (hoặc `Npcap Loopback Adapter`).
3. Nếu kiểm thử giữa 2 máy tính khác nhau trong mạng LAN:
   - Chọn card mạng: **Wi-Fi** hoặc **Ethernet**.

---

## 3. Các bộ lọc hiển thị hữu ích trong Wireshark (Display Filters)

### 3.1. Lọc bản tin Signaling (TCP / WebSocket)
```text
tcp.port == 5000
```
Hoặc chỉ lọc riêng khung WebSocket:
```text
websocket
```
**Mục tiêu quan sát:**
- Tìm kiếm các chuỗi văn bản JSON: `"JOIN_ROOM"`, `"OFFER"`, `"ANSWER"`, `"ICE_CANDIDATE"`.
- Quan sát cờ TCP ACK, TCP SYN, SYN-ACK trong quá trình bắt tay 3 bước (3-way handshake) giữa Client và Server.

---

### 3.2. Lọc bản tin STUN (NAT Traversal qua UDP)
```text
stun
```
**Mục tiêu quan sát:**
- Các bản tin **Binding Request** từ Client gửi tới server STUN (`stun.l.google.com:19302`).
- Các bản tin **Binding Success Response** trả về chứa thuộc tính `XOR-MAPPED-ADDRESS` (địa chỉ IP và cổng công khai của Client).

---

### 3.3. Lọc kênh bảo mật DTLS Handshake (UDP)
```text
dtls
```
**Mục tiêu quan sát:**
- Bản tin `Client Hello`, `Server Hello`, `Certificate`, `Key Exchange` để thiết lập khóa mã hóa trực tiếp giữa 2 Peer mà không thông qua Server.

---

### 3.4. Lọc luồng dữ liệu P2P (DataChannel Whiteboard & Chat)
```text
sctp
```
**Mục tiêu quan sát:**
- Các khối dữ liệu `DATA chunk` chứa gói tin JSON của Whiteboard (`CREATE`, `UPDATE`, `CURSOR`) và tin nhắn Chat được truyền tức thời qua UDP.

---

### 3.5. Lọc luồng âm thanh và hình ảnh (Audio / Video)
```text
udp && (rtp || rtcp || srtp)
```
**Mục tiêu quan sát:**
- Tốc độ truyền gói tin liên tục (packet stream) với tần suất cao (khoảng 30 - 60 packets/giây cho video và 50 packets/giây cho audio).
- Độ biến thiên độ trễ (Jitter) và số lượng gói bị rớt (Packet Loss) thông qua các bản tin RTCP Receiver Report.

---

## 4. Bảng so sánh thực nghiệm TCP vs UDP trong NowaDraw

| Tiêu chí | TCP (Signaling / REST) | UDP (WebRTC Media & DataChannel) |
| :--- | :--- | :--- |
| **Độ trễ trung bình (Latency)** | Cao hơn (phụ thuộc vào RTT máy chủ) | Cực thấp (10ms - 40ms trong mạng P2P nội bộ) |
| **Kiểm soát mất gói** | Có Retransmission (gây ra Head-of-line blocking nếu mạng chập chờn) | Bỏ qua gói trễ (đối với Video/Audio) hoặc retransmission nhẹ qua SCTP |
| **Tải trên Server** | Server xử lý toàn bộ kết nối và định tuyến | Server giải phóng 100% băng thông media sau khi P2P thành công |
| **Hiệu ứng đồ họa Whiteboard** | Trễ nếu có nghẽn mạng | Nét vẽ mượt mà, đồng bộ tức thì giữa các người dùng |
