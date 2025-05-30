import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSubmitComponent } from './report-submit.component';

describe('ReportSubmitComponent', () => {
  let component: ReportSubmitComponent;
  let fixture: ComponentFixture<ReportSubmitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSubmitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
