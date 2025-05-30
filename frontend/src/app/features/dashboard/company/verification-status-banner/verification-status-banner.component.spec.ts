import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationStatusBannerComponent } from './verification-status-banner.component';

describe('VerificationStatusBannerComponent', () => {
  let component: VerificationStatusBannerComponent;
  let fixture: ComponentFixture<VerificationStatusBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationStatusBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationStatusBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
