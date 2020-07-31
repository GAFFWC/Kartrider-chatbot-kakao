FROM node:12-alpine

# 환경 설정
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# 앱 디렉터리 생성
WORKDIR /usr/src/app

# 시스템 파일 복사
#COPY gke-default-key.json .

# 패키지 파일 복사
COPY package.json .
COPY package-lock.json .

# 앱 소스 추가
COPY app/ .

# npm 설치
RUN npm install
RUN npm audit fix

# Production
CMD [ "node", "app.js" ]

# Development
RUN npm install pm2 -g
CMD ["pm2-runtime", "./app.js"]
