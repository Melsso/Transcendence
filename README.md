# Transcendence 42 Project

## Overview

The Transcendence 42 project is a dynamic gaming platform featuring an exciting game: **Pong**. The platform includes a robust chat system, a matchmaking system, and a tournament system, allowing players to engage in competitive and cooperative play.

## Features

- **Games Available**:
  - **Pong**: A classic arcade game where players control paddles to hit a ball back and forth.
- **Chat System**: Engage in real-time discussions with other players through our integrated chat functionality.
- **Matchmaking System**: Connect with players of similar skill levels for competitive matches.
- **Tournament System**: Participate in organized tournaments to test your skills against the best players.

## Technologies Used

- **Backend**:
  - **Django**: A high-level Python web framework for building robust applications.
  - **PostgreSQL**: A powerful open-source relational database system for data storage.
  - **Daphne**: An HTTP/WebSocket protocol server for handling asynchronous communication.
- **Frontend**:
  - **JavaScript**: For dynamic interactivity within the web application.
  - **HTML/CSS**: The foundation of the web pages.
  - **Bootstrap**: A popular front-end framework for responsive design.
- **Containerization**:
  - **Docker**: For containerizing the application and managing dependencies.
- **Caching**:
  - **Redis**: A high-performance in-memory data store used for caching and real-time data management.
- **Web Server**:
  - **NGINX**: A high-performance web server and reverse proxy for serving the application.

## Installation

To set up the Transcendence 42 project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Melsso/Transcendence.git
   cd Transcendence
   ```
2. **Build the Docker Containers**:

	```bash
	make
	```
3. **Create a Superuser (optional)**:
	```bash
	docker exec -it <container_name> bash
	python manage.py createsuperuser
	```
4. **Access the Application**:
Open your web browser and go to http://localhost:8000 to access the platform.

## Usage

1. **Create an Account**: Sign up to create your player profile.
2. **Choose a Game**: Select between Pong or Ricochet Robots.
3. **Join a Match**: Use the matchmaking system to find opponents or challenge friends.
4. **Participate in Tournaments**: Enter tournaments to compete against other players.
5. **Chat with Players**: Use the chat system to communicate with other players during matches.

## Contributing

Contributions are welcome! If you would like to contribute to the Transcendence 42 project, please follow these steps:

1. **Fork the Repository**: Click on the "Fork" button to create your own copy of the project.
2. **Create a New Branch**: Use a descriptive name for your branch:
	```bash
	git checkout -b feature/your-feature-name
	```
3. **Make Your Changes**: Implement your feature or fix bugs as necessary.
4. **Commit Your Changes**: Write clear commit messages:
	```bash
	git commit -m "Add feature or fix bug description"
	```
5. **Push to Your Forked Repository**:
	```bash
	git push origin feature/your-feature-name
	```
6. **Open a Pull Request**: Submit your changes for review.

## License
This project is licensed under the MIT License.

## Contact
For questions, suggestions, or feedback, please contact us at [your.pong.website@gmail.com].

## Acknowledgments
Thanks to the contributors and the 42 community for their support and feedback.
Special thanks to all players and testers who help improve the platform.
