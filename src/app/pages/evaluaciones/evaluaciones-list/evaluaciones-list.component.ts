import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './evaluaciones-list.component.html',
  styleUrl: './evaluaciones-list.component.scss'
})
export class EvaluacionesListComponent implements OnInit {

  loading = true;
  evaluations: any[] = [];
  error: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchEvaluations();
  }

fetchEvaluations() {
  this.loading = true;

  setTimeout(() => {
    const stored = sessionStorage.getItem('assessments');

    if (stored) {
      this.evaluations = JSON.parse(stored);
    } else {
      this.evaluations = [];
    }
    console.log("📦 Evaluaciones :", this.evaluations);


    this.loading = false;
  }, 500);
}


goToAssessment(id: number) {
  this.router.navigate(['/take-assessment', id]);
}

}
