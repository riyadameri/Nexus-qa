document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('questionInput');
    const featuredCheckbox = document.getElementById('featuredCheckbox');
    const submitButton = document.getElementById('submitQuestion');
    const message = document.getElementById('message');
    const questionsList = document.getElementById('questionsList');
    
    // Fetch recent questions
    fetchQuestions();
    
    // Submit question
    submitButton.addEventListener('click', async () => {
        const questionText = questionInput.value.trim();
        const isFeatured = featuredCheckbox.checked;
        
        if (!questionText) {
            showMessage('الرجاء إدخال سؤال', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: questionText,
                    featured: isFeatured
                }),
            });
            
            if (response.ok) {
                questionInput.value = '';
                featuredCheckbox.checked = false;
                showMessage('تم إرسال سؤالك بنجاح!', 'success');
                fetchQuestions();
            } else {
                throw new Error('Failed to submit question');
            }
        } catch (err) {
            showMessage('حدث خطأ أثناء إرسال السؤال', 'error');
            console.error(err);
        }
    });
    
    // Fetch and display questions
    async function fetchQuestions() {
        try {
            const response = await fetch('/api/questions');
            const questions = await response.json();
            
            questionsList.innerHTML = '';
            
            if (questions.length === 0) {
                questionsList.innerHTML = '<p class="no-questions">لا توجد أسئلة بعد</p>';
                return;
            }
            
            questions.slice(0, 5).forEach(question => {
                const questionItem = document.createElement('div');
                questionItem.className = `question-item ${question.featured ? 'featured' : ''}`;
                
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.textContent = question.text;
                
                const questionMeta = document.createElement('div');
                questionMeta.className = 'question-meta';
                
                const dateSpan = document.createElement('span');
                dateSpan.className = 'question-date';
                dateSpan.textContent = new Date(question.createdAt).toLocaleString();
                
                const statusSpan = document.createElement('span');
                statusSpan.className = `question-status ${question.answered ? 'answered' : 'pending'}`;
                statusSpan.textContent = question.answered ? 'تم الإجابة' : 'قيد الانتظار';
                
                questionMeta.appendChild(dateSpan);
                questionMeta.appendChild(statusSpan);
                
                questionItem.appendChild(questionText);
                questionItem.appendChild(questionMeta);
                
                if (question.answered && question.answer) {
                    const answerText = document.createElement('div');
                    answerText.className = 'answer-text';
                    answerText.textContent = question.answer;
                    questionItem.appendChild(answerText);
                }
                
                questionsList.appendChild(questionItem);
            });
        } catch (err) {
            console.error('Error fetching questions:', err);
            questionsList.innerHTML = '<p class="error-message">حدث خطأ أثناء جلب الأسئلة</p>';
        }
    }
    
    // Show message to user
    function showMessage(text, type) {
        message.textContent = text;
        message.className = type;
        
        setTimeout(() => {
            message.textContent = '';
            message.className = '';
        }, 5000);
    }
});