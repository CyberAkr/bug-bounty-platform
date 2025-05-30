import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyWelcomeComponent } from './company-welcome.component';

describe('CompanyWelcomeComponent', () => {
  let component: CompanyWelcomeComponent;
  let fixture: ComponentFixture<CompanyWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyWelcomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
