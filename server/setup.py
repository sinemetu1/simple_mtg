from setuptools import setup, find_packages

api = [
  'flask >= 0.12.0'
  , 'flask-socketio'
  , 'flask-login'
  , 'flask-session'
  , 'eventlet'
  , 'redis'
]

setup(
  name='simple_mtg_server',
  version='0.1.0',
  author='Sam Garrett',
  author_email='samdgarrett@gmail.com',
  description='Simple websocket server for simple_mtg.',
  install_requires=api,
  packages=find_packages(exclude=['tests'])
)
