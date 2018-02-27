#!/usr/bin/env python
import logging
import os

from threading import Lock
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)
# thread = None
# thread_lock = Lock()


# def background_thread():
    # """Example of how to send server generated events to clients."""
    # count = 0
    # while True:
        # socketio.sleep(10)
        # count += 1
        # socketio.emit('my_response',
                      # {'data': 'Server generated event', 'count': count},
                      # namespace='/test')


# @app.route('/')
# def index():
    # return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('my_event', namespace='/test')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})


# @socketio.on('my_broadcast_event', namespace='/test')
# def test_broadcast_message(message):
    # session['receive_count'] = session.get('receive_count', 0) + 1
    # emit('my_response',
         # {'data': message['data'], 'count': session['receive_count']},
         # broadcast=True)


@socketio.on('join', namespace='/test')
def join(message):
    room = message['room']
    name = message['name']
    join_room(room)
    logging.info("{} joined {}".format(name, room))

    session['receive_count'] = session.get('receive_count', 0) + 1
    # emit('my_response',
         # {'data': name + ' in rooms: ' + ', '.join(rooms()),
          # 'count': session['receive_count']})
    emit('share_room',
         {'data': room, # 'Tell your friends to join this room: <b>' + room + '</b>',
          'count': session['receive_count']
          })
    # message the room:
    emit('room_entered',
        {'data': room,
          'from': name
          },
        room=room)


@socketio.on('leave', namespace='/test')
def leave(message):
    leave_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'In rooms: ' + ', '.join(rooms()),
          'count': session['receive_count']})


@socketio.on('close_room', namespace='/test')
def close(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response', {'data': 'Room ' + message['room'] + ' is closing.',
                         'count': session['receive_count']},
         room=message['room'])
    close_room(message['room'])


@socketio.on('my_room_event', namespace='/test')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    logging.info("Sending {} to {}".format(message['data'], message['room']));
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         room=message['room'])

@socketio.on('room_card_event', namespace='/test')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    to_emit = "cast {} to their {}".format(
        message['data']['card_name'],
        message['loc']
    )
    emit('room_card_event',
        {
          'data': to_emit,
          'obj': message,
          'count': session['receive_count'],
          'from': message['name'],
          'type': 'room_card_event'
        },
        room=message['room']
    )


@socketio.on('hand_update_event', namespace='/test')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    to_emit = "{} updated their {}".format(
        message['name'],
        message['loc']
    )
    emit('hand_update_event',
        {
          'data': to_emit,
          'obj': message,
          'count': session['receive_count'],
          'from': message['name']
        },
        room=message['room']
    )


@socketio.on('disconnect_request', namespace='/test')
def disconnect_request():
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'Disconnected!', 'count': session['receive_count']})
    disconnect()


@socketio.on('my_ping', namespace='/test')
def ping_pong():
    emit('my_pong')


@socketio.on('connect', namespace='/test')
def test_connect():
    # global thread
    # with thread_lock:
        # if thread is None:
            # thread = socketio.start_background_task(target=background_thread)
    emit('connected', {'data': 'Connected', 'count': 0})


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected', request.sid)

def main():
    logging.basicConfig(level=logging.INFO)
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
