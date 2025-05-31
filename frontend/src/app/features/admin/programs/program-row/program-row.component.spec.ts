import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramRowComponent } from './program-row.component';

describe('ProgramRowComponent', () => {
  let component: ProgramRowComponent;
  let fixture: ComponentFixture<ProgramRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
