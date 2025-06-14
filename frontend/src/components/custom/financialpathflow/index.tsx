"use client";

import { useCallback, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Mic, MicOff, Send } from 'lucide-react';
import { motion } from 'framer-motion';

// Define custom types for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [index: number]: SpeechRecognitionResult;
  };
}

interface CustomSpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface CustomSpeechRecognitionErrorEvent {
  error: string;
}

interface StrategyStyle {
  background: string;
  border: string;
  stroke?: string;
}

interface FlowNode extends Node {
  style: StrategyStyle;
}

interface FlowEdge extends Edge {
  style: StrategyStyle;
}

interface LegendItem {
  color: string;
  label: string;
}

interface Strategy {
  name: string;
  color: string;
  description: string;
  expectedReturns: string;
  initialInvestment: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  legend: LegendItem[];
}

interface Recommendation {
  selectedStrategy: string;
  riskLevel: string;
  expectedReturns: string;
  explanation: string;
}

interface ServerResponse {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface SampleInput {
  title: string;
  text: string;
}

const sampleInputs: SampleInput[] = [
  {
    title: "Conservative Investor",
    text: "",
  },
  {
    title: "Balanced Growth",
    text: "I want to invest 10 lakhs based on the risk. Give me different asset classes.",
  },
  {
    title: "Aggressive Growth",
    text: "I'm seeking high returns and can take high risks. I want to invest ₹1 lakh for 7-10 years in growth-oriented instruments. Market volatility doesn't worry me.",
  },
];

const FinancialPathFlow = () => {
  const [activeTab, setActiveTab] = useState('conservative');
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFlowchart, setShowFlowchart] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [serverData, setServerData] = useState<ServerResponse | null>(null);
  const flowchartRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSpeechToText = () => {
    if (!isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: CustomSpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setUserInput(transcript);
          if (textareaRef.current) {
            textareaRef.current.value = transcript;
          }
        };

        recognition.onerror = (event: CustomSpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    } else {
      setIsListening(false);
      window.speechSynthesis.cancel();
    }
  };

  const handleStrategySelect = (strategy: string) => {
    setActiveTab(strategy);
  };

  const handleGenerate = async () => {
    if (!activeTab) return;

    setIsGenerating(true);
    setShowFlowchart(false);

    try {
      const formData = new FormData();
      formData.append('input', userInput || 'I\'m looking for a low-risk investment strategy to preserve my capital. I prefer stable returns and want to invest ₹1 lakh for 3-5 years. Safety is my primary concern.');
      formData.append('risk', activeTab);

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://127.0.0.1:5000/ai-financial-path',
        data: formData,
      };

      const response = await axios.request(config);
      const data: ServerResponse = response.data;
      setServerData(data);

      // Update nodes and edges with styles
      setNodes(data.nodes.map(node => ({
        ...node,
        className: `${node.style.background} border-2 ${node.style.border} rounded-lg p-4 text-center font-medium shadow-md`,
        data: {
          ...node.data,
          label: (node.data as { label: string }).label.replace('â‚¹', '₹'),
        },
      })));

      setEdges(data.edges.map(edge => ({
        ...edge,
        className: edge.style.stroke,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        markerEnd: { type: 'arrowclosed', color: edge.style.stroke },
      })));

      setShowFlowchart(true);

      // Add a small delay to ensure the flowchart is rendered before scrolling
      setTimeout(() => {
        flowchartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error('Error generating pathway:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    // Automatically adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleSampleInput = (text: string) => {
    setUserInput(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const tabs = [
    {
      id: 'conservative',
      label: 'Conservative',
      color: 'blue',
      description: 'Low-risk approach focusing on capital preservation with stable returns',
      returns: '7-9% p.a.',
    },
    {
      id: 'moderate',
      label: 'Moderate',
      color: 'indigo',
      description: 'Balanced approach with moderate risk and growth potential',
      returns: '12-15% p.a.',
    },
    {
      id: 'aggressive',
      label: 'Aggressive',
      color: 'red',
      description: 'High-risk, high-reward strategy focusing on growth',
      returns: '15-20% p.a.',
    },
  ];

  return (
    <div className="min-h-screen bg-blue-100 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl mb-3">
            Investment Pathway Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Visualize your personalized investment strategy based on your goals and risk tolerance.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Sample Inputs */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Sample Inputs:</span>
              <span className="ml-2 text-xs text-gray-500">(Click to populate)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleInputs.map((sample, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSampleInput(sample.text)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 flex items-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-gray-700 group-hover:text-blue-700">{sample.title}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Textarea and Strategy Selection */}
          <div className="p-6 space-y-6">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleTextareaInput}
                placeholder="Describe your investment goals, risk tolerance, and preferences..."
                className="w-full min-h-[120px] p-4 text-gray-800 placeholder-gray-500 bg-gray-100 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-300"
                style={{ height: 'auto' }}
              />
              <button
                onClick={handleSpeechToText}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isListening
                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>

            {/* Strategy Selection */}
            <div className="grid grid-cols-3 gap-3">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => handleStrategySelect(tab.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-102 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 bg-${tab.color}-50/50 text-${tab.color}-700 shadow-sm`
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className="text-xs mt-0.5 opacity-75">Returns: {tab.returns}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <motion.button
              onClick={handleGenerate}
              disabled={!activeTab || isGenerating}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-102 ${
                activeTab && !isGenerating
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="h-5 w-5" />
              <span>{isGenerating ? 'Analyzing...' : 'Generate Pathway'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isGenerating && (
          <motion.div
            className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto mt-8 border border-gray-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Creating Your Personalized Investment Pathway</h3>
            <p className="mt-2 text-gray-600">
              Analyzing your preferences and generating the optimal investment strategy...
            </p>
          </motion.div>
        )}

        {/* Flowchart Display */}
        {showFlowchart && serverData && (
          <motion.div
            ref={flowchartRef}
            className="space-y-6 mt-8 animate-fade-in scroll-mt-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Flowchart */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="h-[600px] w-full bg-gray-100">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  className="bg-gray-100"
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed', color: '#555' },
                  }}
                >
                  <Background color="#ccc" size={1} />
                  <Controls />
                </ReactFlow>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FinancialPathFlow;