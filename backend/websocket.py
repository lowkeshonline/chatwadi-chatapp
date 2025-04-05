import asyncio
import websockets
import json

connected_users = {}

async def handler(websocket, path):
    params = dict(websocket.path_parameters)
    user_id = params.get("user_id")

    connected_users[user_id] = websocket
    print(f"User {user_id} connected")

    try:
        async for message in websocket:
            data = json.loads(message)

            if data["type"] == "message":
                sender_id = data["sender_id"]
                receiver_id = data["receiver_id"]
                msg = data["message"]

                # Save message in MongoDB
                chat = {
                    "sender_id": sender_id,
                    "receiver_id": receiver_id,
                    "message": msg
                }
                chats.insert_one(chat)

                # Send message to the receiver if online
                if receiver_id in connected_users:
                    await connected_users[receiver_id].send(json.dumps(chat))

    except Exception as e:
        print(f"Error: {e}")

    finally:
        del connected_users[user_id]
        print(f"User {user_id} disconnected")

async def main():
    server = await websockets.serve(handler, "localhost", 6789)
    print("WebSocket server started on ws://localhost:6789")

    try:
        await asyncio.Future()  # Run forever
    except asyncio.CancelledError:
        print("Server is shutting down...")
    finally:
        server.close()
        await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
