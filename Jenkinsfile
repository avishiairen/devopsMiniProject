pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checkout Source Code ==='
                checkout scm
            }
        }

        stage('Backend Syntax Check') {
            steps {
                echo '=== Stage 2: Checking Backend JavaScript Syntax ==='
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh '''
                                node --check server.js
                                node --check models/Project.js
                                node --check models/Task.js
                                node --check models/Release.js
                                node --check routes/dashboard.js
                                node --check routes/projects.js
                                node --check routes/tasks.js
                                node --check routes/releases.js
                            '''
                        } else {
                            bat '''
                                node --check server.js
                                node --check models/Project.js
                                node --check models/Task.js
                                node --check models/Release.js
                                node --check routes/dashboard.js
                                node --check routes/projects.js
                                node --check routes/tasks.js
                                node --check routes/releases.js
                            '''
                        }
                    }
                }
            }
        }

        stage('Frontend Build') {
            steps {
                echo '=== Stage 3: Installing Frontend Dependencies & Vite Production Build ==='
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm run build'
                        } else {
                            bat 'npm install'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '=== Stage 4: Building Production Docker Images ==='
                script {
                    if (isUnix()) {
                        sh 'docker compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' ✅ CI/CD Pipeline Completed Successfully!'
            echo ' ShipShape artifacts and images are ready.'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' ❌ Pipeline Failed. Review logs above for details.'
            echo '=================================================='
        }
    }
}
