#!/usr/bin/env groovy

pipeline {
    agent any
    tools {
        nodejs('24.4.1') 
    }
    environment {
        DOCKER_REPO_SERVER = '987250612363.dkr.ecr.eu-north-1.amazonaws.com'
        DOCKER_REPO = '987250612363.dkr.ecr.eu-north-1.amazonaws.com/eyegotask'
    }
    stages {
        stage('increament version') {
            steps {
                script {
                    echo 'increamenting version...'
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                        sh 'git config user.name "jenkins"'
                        sh 'git config user.email "jenkins@example.com"'
                        sh 'git remote set-url origin https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/AbdelrahmanElshahat/Eyego-task.git'
                        sh 'git checkout main'
                        sh 'git pull --rebase origin main'
                    }
                    sh 'npm version patch --no-git-tag-version'
                    def packageJson = readJSON file: 'package.json'
                    def version = packageJson.version
                    env.IMAGE_TAG = version
                    echo "New version: ${version}"
                }
            }
        }
        stage('build app') {
            steps {
               script {
                        echo "building the application..."
                        sh 'npm install'
               }
            }
        }
        stage('build image') {
            steps {
                script {
                    echo "building the docker image..."
                    withCredentials([usernamePassword(credentialsId: 'ecr-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh "docker build -t eyegotask:${IMAGE_TAG} . "
                        sh "docker tag eyegotask:${IMAGE_TAG} ${DOCKER_REPO}:${IMAGE_TAG}"
                        sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin ${DOCKER_REPO_SERVER}"
                        sh "docker push ${DOCKER_REPO}:${IMAGE_TAG}"
                    }
                }
            }
        }
        stage('deploy') {
            environment {
               AWS_ACCESS_KEY_ID = credentials('jenkins_aws_access_key_id')
               AWS_SECRET_ACCESS_KEY = credentials('jenkins_aws_secret_access_key')
               APP_NAME = 'eyego-api'
            }
            steps {
                script {
                   echo 'deploying docker image...' 
                   sh 'envsubst < kubernetes/api.yaml | kubectl apply -f -'
                }
            }
        }
      stage('commit version update') {
            steps {
                script {
                    echo 'committing version...'
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                        sh 'git config user.name "jenkins"'
                        sh 'git config user.email "jenkins@example.com"'
                        sh 'git remote set-url origin https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/AbdelrahmanElshahat/Eyego-task.git'
                        sh 'git add package.json'
                        sh 'git commit -m "Bump version to ${IMAGE_TAG}" || echo "No changes to commit"'
                        sh 'git push origin HEAD:main'
                    }
                }
            }
        }
    }
}
