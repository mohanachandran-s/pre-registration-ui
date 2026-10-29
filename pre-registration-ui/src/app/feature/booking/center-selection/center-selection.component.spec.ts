import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterSelectionComponent } from './center-selection.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/i18n.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { BookingModule } from '../booking.module';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { BookingService } from '../booking.service';

describe('CenterSelectionComponent', () => {
  let component: CenterSelectionComponent;
  let locationData = {
    response: [
      {
        locationHierarchylevel: 2,
        locationHierarchyName: 'city',
        isActive: true
      }
    ]
  };
  let center = {
    response: [
      {
        id: '10002',
        name: 'Rural Municipal Mnasra',
        centerTypeCode: 'REG',
        addressLine1: 'Route De Moulay Bousselham',
        addressLine2: 'Douar Sbih Menacera',
        addressLine3: 'MyCountry',
        latitude: '34.360207',
        longitude: '-6.550075',
        locationCode: '14053',
        holidayLocationCode: 'KTA',
        contactPhone: '753476995',
        workingHours: '8:00:00',
        langCode: 'eng',
        numberOfKiosks: 1,
        perKioskProcessTime: '00:15:00',
        centerStartTime: '09:00:00',
        centerEndTime: '17:00:00',
        timeZone: '(GTM+01:00) CENTRAL EUROPEAN TIME',
        contactPerson: 'John Smith',
        lunchStartTime: '13:00:00',
        lunchEndTime: '14:00:00',
        isActive: true
      }
    ]
  };

  let centers = {
    registrationCenters: [center]
  };

  let service: DataStorageService,
    mockService = {
      getLocationTypeData: jasmine.createSpy('getLocationTypeData').and.returnValue(of(locationData)),
      recommendedCenters: jasmine.createSpy('recommendedCenters').and.returnValue(of(center)),
      getRegistrationCentersByName: jasmine.createSpy('getRegistrationCentersByName').and.returnValue(of(centers))
    };

  let userService: BookingService,
    mockUsers = {
      getNameList: jasmine.createSpy('getNameList').and.returnValue(of([{ fullName: 'Agn', preId: '1234' }])),
      changeCoordinates: jasmine.createSpy('changeCoordinates').and.returnValue(of([11.111, 11.11])),
      listOfCenters: jasmine
        .createSpy('listOfCenters')
        .and.returnValue(of([{ id: '1001', latitude: 11.111, longitude: 11.11 }]))
    };
  let fixture: ComponentFixture<CenterSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        HttpClientModule,
        MaterialModule,
        FormsModule,
        BookingModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: DataStorageService,
          useValue: mockService
        },
        {
          provide: BookingService,
          useValue: mockUsers
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set search flag', () => {
    component.setSearchClick(true);
    fixture.detectChanges();
    expect(component.searchClick).toBeTruthy();
  });

  it('should test onSubmit', () => {
    component.searchText = 'hello';
    component.onSubmit();
    fixture.detectChanges();
    expect(component.searchTextFlag).toBeTruthy();
  });

  it('should set the step', () => {
    component.setStep(1);
    fixture.detectChanges();
    expect(component.step).toBe(1);
  });

  it('should increase step', () => {
    component.setStep(2);
    component.nextStep();
    fixture.detectChanges();
    expect(component.step).toBe(3);
  });

  it('should decrease step', () => {
    component.setStep(2);
    component.prevStep();
    fixture.detectChanges();
    expect(component.step).toBe(1);
  });

  it('should change time format', () => {
    let x = component.changeTimeFormat('09:00');
    fixture.detectChanges();
    expect(x).toBe('09:00 am');
  });

  it('should change time format for afternoon', () => {
    let x = component.changeTimeFormat('17:00');
    fixture.detectChanges();
    expect(x).toBe('5:00 pm');
  });

  it('should test display results', () => {
    const response = {};
    component.displayResults(response);
    fixture.detectChanges();
    expect(component.showTable).toBeTruthy();
  });

  it('should dispatch coordinates list', () => {
    component.REGISTRATION_CENTRES = [];
    component.dispatchCenterCoordinatesList();
    fixture.detectChanges();
    mockUsers.listOfCenters().subscribe(value => {
      expect(value[0].id).toBe('1001');
    });
  });

  it('should test selected row', () => {
    const row = {};
    component.selectedRow(row);
    fixture.detectChanges();
    expect(component.enableNextButton).toBeTruthy();
  });

  describe('getRecommendedCenterLocationField', () => {
    const addressFields = [
      { id: 'permanentCity', inputRequired: true, controlType: 'dropdown', locationHierarchyLevel: 3 },
      { id: 'presentZipcode', inputRequired: true, controlType: 'dropdown', locationHierarchyLevel: 5 },
      { id: 'proofOfAddress', inputRequired: true, controlType: 'fileupload', locationHierarchyLevel: 5 },
      { id: 'permanentZipcode', inputRequired: true, controlType: 'dropdown', locationHierarchyLevel: 5 }
    ];
    let savedConfig: string;

    beforeEach(() => {
      savedConfig = localStorage.getItem('config');
      component.identityData = addressFields;
      component.recommendedCenterLocCode = 5;
    });

    afterEach(() => {
      if (savedConfig === null) {
        localStorage.removeItem('config');
      } else {
        localStorage.setItem('config', savedConfig);
      }
    });

    it('should use the configured address field', () => {
      localStorage.setItem('config', JSON.stringify({ 'preregistration.recommended.centers.locationField': 'presentZipcode' }));
      expect(component.getRecommendedCenterLocationField()).toBe('presentZipcode');
    });

    it('should use the last address field when not configured', () => {
      localStorage.setItem('config', JSON.stringify({ 'preregistration.recommended.centers.locationField': '' }));
      expect(component.getRecommendedCenterLocationField()).toBe('permanentZipcode');
    });

    it('should ignore a configured field that is not at the recommended hierarchy level', () => {
      localStorage.setItem('config', JSON.stringify({ 'preregistration.recommended.centers.locationField': 'permanentCity' }));
      expect(component.getRecommendedCenterLocationField()).toBe('permanentZipcode');
    });

    it('should return null when there is no address field at the recommended hierarchy level', () => {
      component.recommendedCenterLocCode = 4;
      expect(component.getRecommendedCenterLocationField()).toBeNull();
    });
  });
});
