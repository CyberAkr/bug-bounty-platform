import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeWeekComponent } from './challenge-week.component';

describe('ChallengeWeekComponent', () => {
  let component: ChallengeWeekComponent;
  let fixture: ComponentFixture<ChallengeWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeWeekComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
