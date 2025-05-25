
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizPageProps {
  topic: string;
  onComplete: (passed: boolean, topic: string) => void;
  onBack: () => void;
}

const generateQuestions = (topic: string): Question[] => {
  // Mock quiz generation - in a real app, this would use GPT API
  const questions: Question[] = [];
  
  for (let i = 1; i <= 5; i++) {
    questions.push({
      id: i,
      question: `Which of the following is a key concept in ${topic}? (Question ${i})`,
      options: [
        `Basic principle of ${topic}`,
        `Advanced theorem in ${topic}`,
        `Fundamental law of ${topic}`,
        `Core methodology of ${topic}`
      ],
      correctAnswer: Math.floor(Math.random() * 4)
    });
  }
  
  return questions;
};

const QuizPage = ({ topic, onComplete, onBack }: QuizPageProps) => {
  const [questions] = useState<Question[]>(() => generateQuestions(topic));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const passed = correctAnswers >= 4; // Need 4/5 to pass
    
    setShowResults(true);
    
    setTimeout(() => {
      if (passed) {
        toast({
          title: "🎉 Quiz Passed!",
          description: "Congratulations! You earned 5 silver coins!",
        });
      } else {
        toast({
          title: "Quiz Failed",
          description: `You got ${correctAnswers}/5 correct. You need 4/5 to pass. Try again!`,
          variant: "destructive",
        });
      }
      onComplete(passed, topic);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const passed = correctAnswers >= 4;

    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-2">
                {passed ? "Congratulations!" : "Keep Learning!"}
              </h2>
              <p className="text-gray-600">
                You scored {correctAnswers}/5 correct answers
              </p>
            </div>
            
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-2 rounded">
                  <span className="text-sm">Question {index + 1}</span>
                  {answers[question.id] === question.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
            
            {passed && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">+5 Silver Coins Earned!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className={`font-mono ${timeLeft < 60 ? 'text-red-500' : 'text-gray-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Quiz Content */}
        <Card>
          <CardHeader>
            <CardTitle>{topic} Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
              
              <RadioGroup
                value={answers[currentQ.id]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={answers[currentQ.id] === undefined}
              >
                {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p>• You need to answer 4 out of 5 questions correctly to pass</p>
              <p>• Each correct quiz earns you 5 silver coins</p>
              <p>• Time limit: 5 minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPage;
