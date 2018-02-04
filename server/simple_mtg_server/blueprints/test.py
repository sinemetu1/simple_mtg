import logging

from flask import Blueprint, current_app, Response

# CHUNK_SIZE = 1024

bp = Blueprint('simple_mtg_server', __name__)

@bp.route('/ping')
def ping():
  return "pong"

@bp.route('/listen')
def listen():
  html = """
  <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.6/socket.io.min.js"></script>
  <script type="text/javascript" src="//code.jquery.com/jquery-1.4.2.min.js"></script>
  <script type="text/javascript" charset="utf-8">
      $(document).ready(function () {
          var namespace = '';
          var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
          socket.on('connect', function() {
              socket.emit('my event', {data: "I\'m connected!"});
          });
      });
  </script>
  """
  return Response(html, mimetype='text/html')
