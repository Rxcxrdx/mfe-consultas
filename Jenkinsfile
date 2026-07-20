pipeline {
  agent any

  environment {
    ACR_LOGIN_SERVER = 'devopslab01acr.azurecr.io'
    APP_NAME         = 'mfe-consultas'
    DEPLOYMENT_NAME  = 'mfe-consultas'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Test') {
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }

    stage('Build imagen') {
      steps {
        // API_URL queda "horneada" en el JS del bundle en el momento del build
        // (esta app hace fetch() a la API directo desde el navegador), así que
        // tiene que ser la IP pública del Ingress, nunca un nombre interno de
        // k8s. Se resuelve en vivo por si el LoadBalancer cambió de IP.
        withKubeConfig([credentialsId: 'kubeconfig-aks']) {
          script {
            env.PUBLIC_URL = 'http://' + sh(
              script: "kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
              returnStdout: true
            ).trim()
          }
        }
        sh """
          docker build --platform linux/amd64 \
            --build-arg API_URL=${PUBLIC_URL}/api \
            -t ${ACR_LOGIN_SERVER}/${APP_NAME}:${BUILD_NUMBER} \
            -t ${ACR_LOGIN_SERVER}/${APP_NAME}:latest \
            .
        """
      }
    }

    stage('Push a ACR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'acr-creds', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
          sh 'echo "$ACR_PASS" | docker login "$ACR_LOGIN_SERVER" -u "$ACR_USER" --password-stdin'
          sh "docker push ${ACR_LOGIN_SERVER}/${APP_NAME}:${BUILD_NUMBER}"
          sh "docker push ${ACR_LOGIN_SERVER}/${APP_NAME}:latest"
        }
      }
    }

    stage('Deploy a AKS') {
      steps {
        withKubeConfig([credentialsId: 'kubeconfig-aks']) {
          sh "kubectl set image deployment/${DEPLOYMENT_NAME} ${DEPLOYMENT_NAME}=${ACR_LOGIN_SERVER}/${APP_NAME}:${BUILD_NUMBER}"
          sh "kubectl rollout status deployment/${DEPLOYMENT_NAME} --timeout=180s"
        }
      }
    }
  }

  post {
    always {
      sh "docker rmi ${ACR_LOGIN_SERVER}/${APP_NAME}:${BUILD_NUMBER} ${ACR_LOGIN_SERVER}/${APP_NAME}:latest || true"
    }
    success {
      echo "OK: ${APP_NAME} build #${BUILD_NUMBER} desplegado en AKS (deployment/${DEPLOYMENT_NAME})"
    }
    failure {
      echo "FALLÓ: ${APP_NAME} build #${BUILD_NUMBER} — revisar el stage que cortó arriba en el log"
    }
  }
}
