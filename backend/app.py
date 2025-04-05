from flask import Flask, request, jsonify
from flask_cors import CORS
from db import users
import bcrypt

app = Flask(__name__)
CORS(app)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if the user already exists
    if users.find_one({'email': email}) is not None:
        return jsonify({'message': 'User already exists'}), 400

    # Hash the password
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Save the user to MongoDB
    new_user = {
        "username": username,
        "email": email,
        "password": hashed_pw.decode('utf-8')
    }
    
    users.insert_one(new_user)

    return jsonify({'message': 'User registered successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
