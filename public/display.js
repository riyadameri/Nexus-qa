document.addEventListener('DOMContentLoaded', () => {
    const displayQuestions = document.getElementById('displayQuestions');
    let selectedQuestionId = null;
    
    // Fetch and display questions
    async function fetchAndDisplayQuestions() {
        try {
            const response = await fetch('/api/questions');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const questions = await response.json();
            
            displayQuestions.innerHTML = '';
            
            if (questions.length === 0) {
                displayQuestions.innerHTML = `
                    <div class="display-question empty-state">
                        <i class="fas fa-question-circle"></i>
                        <h3>لا توجد أسئلة بعد</h3>
                    </div>
                `;
                return;
            }
            
            questions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.className = `display-question ${question.featured ? 'featured' : ''} ${question.answered ? 'answered' : ''}`;
                questionDiv.dataset.id = question._id;
                
                if (question._id === selectedQuestionId) {
                    questionDiv.classList.add('selected');
                }
                
                const questionHeader = document.createElement('div');
                questionHeader.className = 'question-header';
                
                const questionTitle = document.createElement('h3');
                questionTitle.textContent = question.text;
                
                const questionMeta = document.createElement('div');
                questionMeta.className = 'question-meta';
                questionMeta.innerHTML = `
                    <span class="question-date">${new Date(question.createdAt).toLocaleString('ar-EG')}</span>
                    <span class="question-status ${question.answered ? 'answered' : 'pending'}">
                        ${question.answered ? 'تم الإجابة' : 'بانتظار الإجابة'}
                    </span>
                `;
                
                questionHeader.appendChild(questionTitle);
                questionHeader.appendChild(questionMeta);
                questionDiv.appendChild(questionHeader);
                
                if (question.answered && question.answer) {
                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer';
                    
                    const answerTitle = document.createElement('h4');
                    answerTitle.textContent = 'الجواب:';
                    
                    const answerText = document.createElement('p');
                    answerText.textContent = question.answer;
                    
                    answerDiv.appendChild(answerTitle);
                    answerDiv.appendChild(answerText);
                    questionDiv.appendChild(answerDiv);
                }
                
                // Add click event to select question
                questionDiv.addEventListener('click', () => {
                    document.querySelectorAll('.display-question').forEach(q => {
                        q.classList.remove('selected');
                    });
                    
                    questionDiv.classList.add('selected');
                    selectedQuestionId = question._id;
                    
                    // Update admin panel
                    updateAdminPanel(question);
                });
                
                displayQuestions.appendChild(questionDiv);
            });
            
            // Auto-select first question if none selected
            if (!selectedQuestionId && questions.length > 0) {
                const firstQuestion = document.querySelector('.display-question');
                if (firstQuestion) {
                    firstQuestion.click();
                }
            }
        } catch (err) {
            console.error('Error fetching questions:', err);
            displayQuestions.innerHTML = `
                <div class="display-question error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>حدث خطأ أثناء جلب الأسئلة</h3>
                    <p>${err.message}</p>
                </div>
            `;
        }
    }
    
    // Update admin panel with selected question
    function updateAdminPanel(question) {
        const answerInput = document.getElementById('answerInput');
        const markAnsweredBtn = document.getElementById('markAnswered');
        const featureBtn = document.getElementById('featureQuestion');
        const unfeatureBtn = document.getElementById('unfeatureQuestion');
        const deleteBtn = document.getElementById('deleteQuestion');
        
        answerInput.value = '';
        
        if (question.answered) {
            markAnsweredBtn.disabled = true;
            markAnsweredBtn.textContent = 'تم الإجابة';
            answerInput.placeholder = 'يمكنك تعديل الإجابة الحالية';
            if (question.answer) {
                answerInput.value = question.answer;
            }
        } else {
            markAnsweredBtn.disabled = false;
            markAnsweredBtn.textContent = 'تعيين كمجاب عليه';
            answerInput.placeholder = 'اكتب الإجابة هنا...';
        }
        
        if (question.featured) {
            featureBtn.style.display = 'none';
            unfeatureBtn.style.display = 'block';
        } else {
            featureBtn.style.display = 'block';
            unfeatureBtn.style.display = 'none';
        }
    }
    
    // Mark question as answered
    document.getElementById('markAnswered').addEventListener('click', async () => {
        if (!selectedQuestionId) {
            alert('الرجاء اختيار سؤال أولاً');
            return;
        }
        
        const answerText = document.getElementById('answerInput').value.trim();
        if (!answerText) {
            alert('الرجاء إدخال إجابة');
            return;
        }
        
        try {
            const response = await fetch(`/api/questions/${selectedQuestionId}/answer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer: answerText }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to mark as answered');
            }
            
            const updatedQuestion = await response.json();
            fetchAndDisplayQuestions();
            showSuccessMessage('تم حفظ الإجابة بنجاح');
        } catch (err) {
            console.error('Error marking question as answered:', err);
            showErrorMessage(`حدث خطأ أثناء تعيين السؤال كمجاب عليه: ${err.message}`);
        }
    });
    
    // Feature question
    document.getElementById('featureQuestion').addEventListener('click', async () => {
        if (!selectedQuestionId) {
            alert('الرجاء اختيار سؤال أولاً');
            return;
        }
        
        try {
            const response = await fetch(`/api/questions/${selectedQuestionId}/feature`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to feature question');
            }
            
            const updatedQuestion = await response.json();
            fetchAndDisplayQuestions();
            showSuccessMessage('تم تمييز السؤال بنجاح');
        } catch (err) {
            console.error('Error featuring question:', err);
            showErrorMessage(`حدث خطأ أثناء تمييز السؤال: ${err.message}`);
        }
    });
    
    // Unfeature question
    document.getElementById('unfeatureQuestion').addEventListener('click', async () => {
        if (!selectedQuestionId) {
            alert('الرجاء اختيار سؤال أولاً');
            return;
        }
        
        try {
            const response = await fetch(`/api/questions/${selectedQuestionId}/unfeature`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to unfeature question');
            }
            
            const updatedQuestion = await response.json();
            fetchAndDisplayQuestions();
            showSuccessMessage('تم إلغاء تمييز السؤال بنجاح');
        } catch (err) {
            console.error('Error unfeaturing question:', err);
            showErrorMessage(`حدث خطأ أثناء إلغاء تمييز السؤال: ${err.message}`);
        }
    });
    
    // Delete question
    document.getElementById('deleteQuestion').addEventListener('click', async () => {
        if (!selectedQuestionId) {
            alert('الرجاء اختيار سؤال أولاً');
            return;
        }
        
        if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/questions/${selectedQuestionId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete question');
            }
            
            selectedQuestionId = null;
            fetchAndDisplayQuestions();
            showSuccessMessage('تم حذف السؤال بنجاح');
        } catch (err) {
            console.error('Error deleting question:', err);
            showErrorMessage(`حدث خطأ أثناء حذف السؤال: ${err.message}`);
        }
    });
    
    // Show success message
    function showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'notification success';
        messageDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    // Show error message
    function showErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'notification error';
        messageDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    // Initial load
    fetchAndDisplayQuestions();
    setInterval(fetchAndDisplayQuestions, 10000); // Refresh every 10 seconds
});