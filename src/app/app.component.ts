import { Component, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  //Formulario
  itemForm: FormGroup;
  tipos: string[];
  tableData: any[];

  title = 'google-maps';
  zoom = 14;
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    mapTypeId: 'hybrid',
    maxZoom: 15,
    minZoom: 8,
  };
  polylinePath: google.maps.LatLngLiteral[];
  polylineOptions = {
    strokeColor: '#FF0000',
    strokeWeight: 2,
    geodesic: true,
  };
  marker: any;
  infoContent = '';
  intervalSubscription: Subscription;

  constructor(private formBuilder: FormBuilder) {
    this.itemForm = this.formBuilder.group({
      placa: ['', Validators.required],
      tipo: ['', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
    });
    this.polylinePath = [];
    this.tableData = [];
    this.tipos = ['Auto', 'Tracto', 'Camión'];
  }

  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });
  }

  clearIntervals() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.clearIntervals();
  }

  onSubmit() {
    if (this.itemForm.valid) {
      //insertando la data en la tabla historica
      const defaultTime = 30000;
      const current_lat = this.marker.position.lat;
      const current_lng = this.marker.position.lng;

      const markerPosition = { lat: current_lat, lng: current_lng };
      this.polylinePath.push(markerPosition);
      let time = 0;
      this.intervalSubscription = interval(defaultTime).subscribe(() => {
        console.log('polylinePath', this.polylinePath);
        const metersToMove = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
        const directions = ['north', 'northeast', 'northwest'];
        const randomIndex = Math.floor(Math.random() * directions.length);
        const randomDirection = directions[randomIndex];

        time += defaultTime;
        const data = {
          tiempo: time,
          orientacion: randomDirection,
          distancia: metersToMove,
          velocidad: metersToMove / (defaultTime / 1000),
        };

        this.tableData.push(data);

        switch (randomDirection) {
          case 'north':
            this.moveMarkerToNorth(metersToMove);

            break;
          case 'northeast':
            this.moveMarkerToNorthEast(metersToMove);

            break;
          case 'northwest':
            this.moveMarkerToNorthWest(metersToMove);

            break;
          default:
            console.log('Invalid direction');
            break;
        }
      });
    }
  }

  moveMarkerToNorth(metersToMove) {
    const newLat = this.marker.position.lat + metersToMove / 111111; // 1 degree of latitude is approximately 111,111 meters
    this.markerSetPosition(newLat, this.marker.position.lng);
  }

  moveMarkerToNorthEast(metersToMove) {
    const newLat = this.marker.position.lat + metersToMove / 111111;
    const newLng =
      this.marker.position.lng +
      metersToMove /
        (111111 * Math.cos((this.marker.position.lat * Math.PI) / 180));

    this.markerSetPosition(newLat, newLng);
  }

  moveMarkerToNorthWest(metersToMove) {
    const newLat = this.marker.position.lat + metersToMove / 111111;
    const newLng =
      this.marker.position.lng -
      metersToMove /
        (111111 * Math.cos((this.marker.position.lat * Math.PI) / 180));

    this.markerSetPosition(newLat, newLng);
  }

  markerSetPosition(lat, lng) {
    this.marker.position = { lat, lng };
    this.polylinePath.push({ lat, lng });
  }

  zoomIn() {
    if (this.zoom < this.options.maxZoom) this.zoom++;
  }

  zoomOut() {
    if (this.zoom > this.options.minZoom) this.zoom--;
  }

  click(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) {
      console.log(event.latLng.toJSON().lat);
      this.center = event.latLng.toJSON();
      this.marker = {
        position: event.latLng.toJSON(),
        label: {
          color: 'blue',
          text: this.itemForm.get('placa').value
            ? this.itemForm.get('placa').value
            : 'Ingresa la Placa',
        },
        title: this.itemForm.get('tipo').value
          ? this.itemForm.get('tipo').value
          : 'Ingresa el tipo',
        options: { animation: google.maps.Animation.BOUNCE },
      };

      this.itemForm.get('lat').setValue(event.latLng.toJSON().lat);
      this.itemForm.get('lng').setValue(event.latLng.toJSON().lng);
    }
  }

  logCenter() {
    console.log(JSON.stringify(this.map.getCenter()));
  }

  clickMarker() {}
}
