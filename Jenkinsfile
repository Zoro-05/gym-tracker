pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out from GitHub'
            }
        }

        stage('Verify project files') {
            steps {
                bat 'if not exist index.html exit /b 1'
                bat 'if not exist css\\style.css exit /b 1'
                bat 'if not exist js\\script.js exit /b 1'
                echo 'All required project files found'
            }
        }

        stage('Check features present') {
            steps {
                bat 'findstr /C:"export-btn" index.html'
                bat 'findstr /C:"timer-display" index.html'
                echo 'Export CSV and rest timer found in index.html'
            }
        }

        stage('Archive site') {
            steps {
                archiveArtifacts artifacts: 'index.html, css/**, js/**', fingerprint: true
                echo 'Site files archived as build artifacts'
            }
        }
    }

    post {
        success {
            echo 'Iron Log pipeline passed'
        }
        failure {
            echo 'Iron Log pipeline failed'
        }
    }
}
