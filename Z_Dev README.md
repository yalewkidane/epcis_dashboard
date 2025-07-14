docker-compose build

docker tag epcis_data_vista_react-app:latest yaledoc/hybrid_dashboard:0.0.1
docker tag epcis_data_vista_react-app:latest yaledoc/hybrid_dashboard:latest
docker push yaledoc/hybrid_dashboard:0.0.1
docker push yaledoc/hybrid_dashboard:latest

