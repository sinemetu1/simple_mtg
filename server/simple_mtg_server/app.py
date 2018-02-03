import logging

from flask import Flask, render_template
from flask_socketio import SocketIO
from werkzeug.utils import find_modules, import_string


# TODO: join existing/join random room
@socketio.on('join', namespace='/test')
def join(message):
    join_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'In rooms: ' + ', '.join(rooms()),
          'count': session['receive_count']})

def create_app(config=None):
  logging.basicConfig(level=logging.INFO)
  app = Flask(__name__)
  app.config['SECRET_KEY'] = 'secret!'
  register_blueprints(app)
  return app


def register_blueprints(app):
  """Register all blueprint modules."""
  for name in find_modules('simple_mtg_server.blueprints'):
    mod = import_string(name)
    if hasattr(mod, 'bp'):
        app.register_blueprint(mod.bp)
  return None


def main():
  app = create_app()

  print(app.url_map)

  SocketIO(app).run(app)


if __name__ == '__main__':
  main()
