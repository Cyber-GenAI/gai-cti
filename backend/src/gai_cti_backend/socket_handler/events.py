from ..chat.msg import answer_user_msg, send_welcome_msg, submit_user_msg
from ..chat.session import close_session, new_session
from ..models.socket_handler import MessageData
from .emitters import emit_session_start
from .socket import sio

WELCOME_SENT = {}


@sio.event
async def test(sid: str, data: dict):
    print(f"Message from {sid}: {data}")
    await sio.emit("response", f"Server received: {data}", to=sid)


@sio.event
async def on_session_start(sid: str, url_path: str):
    chat_sid = await new_session(sid)
    print(f"Session Started. Session ID: {chat_sid},{url_path}")
    await emit_session_start(chat_sid)
    await send_welcome_msg("", chat_sid, sid, url_path)


@sio.event
async def on_user_msg(sid: str, data: dict):
    msg_data = MessageData.model_validate(data)
    assert msg_data.msg is not None
    assert msg_data.route is not None
    assert msg_data.llm is not None

    await submit_user_msg(msg_data.msg, msg_data.chat_sid, sid)
    await answer_user_msg(
        msg_data.msg, msg_data.llm, msg_data.chat_sid, sid, msg_data.route
    )


@sio.event
async def on_stop(sid: str, data: dict):
    raise NotImplementedError()


@sio.event
async def on_session_end(sid: str, data: dict):
    msg_data = MessageData.model_validate(data)
    chat_sid = msg_data.chat_sid
    await close_session(sid, chat_sid)
    print(f"[Session End] SID: {sid}, Session ID: {chat_sid}")
