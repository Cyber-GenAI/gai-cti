from datetime import time
from time import sleep

import socketio

sio = socketio.Client()


@sio.on("on_msg_init")
def f1(data):
    print(f"on_msg_init # Received response: {data}")


@sio.on("on_session_start")
def f2(data):
    print(f"on_session_start # Received response: {data}")


@sio.on("on_msg_append")
def f3(data):
    print(f"on_msg_append # Received response: {data}")


@sio.on("on_msg_end")
def f4(data):
    print(f"on_msg_end # Received response: {data}")


@sio.on("update_mng_main_table")
def on_update_mng_main_table(data):
    print(f"update_mng_main_table # Received update_mng_main_table: {data}")


def run_client():
    sio.connect("http://localhost:8088/socket.io")
    print("Connected to server")

    # while True:
    #     msg = input("Enter message to send (or 'exit'): ")
    #     if msg.lower() == "exit":
    #         break
    #     sio.emit("test", msg)
    # while True:
    #     sleep(1)
    # sio.disconnect()

    sio.emit("on_session_start", None)
    sleep(3)
    sio.emit("on_user_msg", {"chat_sid": "aaa", "msg": "123456"})
    sleep(3)
    sio.emit("on_session_end", {"chat_sid": "aaa"})
    sleep(10)

    sio.disconnect()


if __name__ == "__main__":
    run_client()
