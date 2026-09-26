import socketio

from .emitters import *
from .events import *
from .socket import sio


def get_socketio_app(app=None):
    return socketio.ASGIApp(sio, app)


__all__ = ["sio", "get_socketio_app"]
