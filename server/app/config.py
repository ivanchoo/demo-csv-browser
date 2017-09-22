# -*- coding: utf-8 -*-
import os


class Config(object):

    # Flask
    SECRET_KEY = os.environ['SECRET_KEY']
    DEBUG = bool(os.environ.get('FLASK_DEBUG'))

    # Database
    DB_NAME = os.environ['POSTGRES_DB']
    DB_USER = os.environ['POSTGRES_USER']
    DB_PASS = os.environ['POSTGRES_PASSWORD']
    DB_SERVICE = os.environ['POSTGRES_SERVICE']
    DB_PORT = os.environ['POSTGRES_PORT']

    # SqlAlchemy
    SQLALCHEMY_DATABASE_URI = 'postgresql://{0}:{1}@{2}:{3}/{4}'.format(
        DB_USER, DB_PASS, DB_SERVICE, DB_PORT, DB_NAME
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = bool(os.environ.get('SQLALCHEMY_ECHO'))

    # Development
    DEV_FRONTEND_URI = os.environ.get('DEV_FRONTEND_URI')
