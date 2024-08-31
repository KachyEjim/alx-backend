#!/usr/bin/env python3
"""Python file"""


from flask import Flask, render_template, request, Response, g
from flask_babel import Babel, _
from typing import Optional, Dict
import pytz

users = {
    1: {"name": "Balou", "locale": "fr", "timezone": "Europe/Paris"},
    2: {"name": "Beyonce", "locale": "en", "timezone": "US/Central"},
    3: {"name": "Spock", "locale": "kg", "timezone": "Vulcan"},
    4: {"name": "Teletubby", "locale": None, "timezone": "Europe/London"},
}


class Config:
    """Language Config class"""

    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = "en"
    BABEL_DEFAULT_TIMEZONE = "UTC"


app = Flask(__name__)
app.config.from_object(Config)

babel = Babel(app)


@babel.localeselector
def get_locale():
    """_summary_

    Returns:
                    _type_: _description_
    """
    # Locale from URL parameters
    locale = request.args.get("locale")
    if locale in app.config["LANGUAGES"]:
        return locale

    # Locale from user settings
    if g.user:
        locale = g.user.get("locale")
        if locale and locale in app.config["LANGUAGES"]:
            return locale

    # ocale from request header
    locale = request.headers.get("locale", None)
    if locale in app.config["LANGUAGES"]:
        return locale

        # Default locale
    return request.accept_languages.best_match(app.config["LANGUAGES"])


@app.route("/")
def home() -> Response:
    """RETURNS A SIMPLE PAGE"""
    return render_template("5-index.html", g=g)


def get_user() -> Optional[Dict]:
    """Returns a user"""
    id = int(request.args.get("login_as"))
    if id in users:
        return users[id]
    return None


@app.before_request
def before_request():
    """EXECUTES BEFRE A REQUEST"""
    g.user = get_user()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=7000)
